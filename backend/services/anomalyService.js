import Alert from '../models/Alert.js';
import Log from '../models/Log.js';
import DetectionRule from '../models/DetectionRule.js';

class AnomalyEngine {
  constructor() {
    this.failedLogins = new Map(); // IP -> array of timestamps
    this.portAccess = new Map(); // IP -> Map(port -> array of timestamps)
    this.rules = new Map(); // Cache of rules

    // Memory cleanup interval
    setInterval(() => this.cleanupMemory(), 5 * 60000);
    
    // Rule refresh interval
    setInterval(() => this.loadRules(), 60000);
    this.loadRules();
  }

  async loadRules() {
    try {
      const dbRules = await DetectionRule.find({});
      dbRules.forEach(rule => this.rules.set(rule.ruleId, rule));
    } catch (e) {
      console.error('Failed to load rules:', e);
    }
  }

  getRule(ruleId) {
    // Return the cached rule, or a safe default if not found
    const rule = this.rules.get(ruleId);
    if (rule) return rule;
    
    // Fallbacks
    const defaults = {
      'brute-force': { enabled: true, threshold: 5, timeWindowMinutes: 10, score: 40, severity: 'CRITICAL', name: 'Brute Force Attack' },
      'port-scan': { enabled: true, threshold: 20, timeWindowMinutes: 5, score: 80, severity: 'HIGH', name: 'Port Scanning' },
      'privilege-esc': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 20, severity: 'HIGH', name: 'Privilege Escalation' },
      'unusual-hours': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 10, severity: 'MEDIUM', name: 'Unusual Login Hours' },
      'admin-direct': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 20, severity: 'HIGH', name: 'Admin Direct Login' },
      'audit-cleared': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 40, severity: 'CRITICAL', name: 'Audit Log Cleared' },
      'account-mod': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 30, severity: 'HIGH', name: 'Suspicious Account Modification' },
      'suspicious-process': { enabled: true, threshold: 1, timeWindowMinutes: 1, score: 20, severity: 'MEDIUM', name: 'Suspicious Process Creation' },
    };
    return defaults[ruleId] || { enabled: false };
  }

  cleanupMemory() {
    const now = Date.now();
    const maxAge = 60 * 60000; // 1 hour max retention in memory

    for (const [ip, timestamps] of this.failedLogins.entries()) {
      const valid = timestamps.filter(t => (now - t.getTime()) < maxAge);
      if (valid.length === 0) {
        this.failedLogins.delete(ip);
      } else {
        this.failedLogins.set(ip, valid);
      }
    }

    for (const [ip, ports] of this.portAccess.entries()) {
      for (const [port, timestamps] of ports.entries()) {
        const valid = timestamps.filter(t => (now - t.getTime()) < maxAge);
        if (valid.length === 0) {
          ports.delete(port);
        } else {
          ports.set(port, valid);
        }
      }
      if (ports.size === 0) {
        this.portAccess.delete(ip);
      }
    }
  }

  async analyze(log) {
    const anomalies = [];
    const now = new Date();
    const messageLower = log.message.toLowerCase();
    
    const bruteForceRule = this.getRule('brute-force');
    const portScanRule = this.getRule('port-scan');
    const privEscRule = this.getRule('privilege-esc');
    const unusualHoursRule = this.getRule('unusual-hours');
    const adminDirectRule = this.getRule('admin-direct');
    const auditClearedRule = this.getRule('audit-cleared');

    // 1. Audit Cleared (1102)
    if (auditClearedRule.enabled && log.metadata && log.metadata.eventId === 1102) {
      anomalies.push({
        type: 'AUDIT_LOG_CLEARED',
        severity: auditClearedRule.severity,
        title: auditClearedRule.name,
        description: `Security audit log was cleared by ${log.user || 'Unknown'} on ${log.hostname || 'Unknown'}`,
        score: auditClearedRule.score,
        reasons: ['Windows Security Event ID 1102 detected']
      });
    }

    // 2. Brute Force (4625 or generic failed login)
    const isWindowsFailedLogin = log.metadata && log.metadata.eventId === 4625;
    if ((messageLower.includes('failed') && messageLower.includes('password')) || isWindowsFailedLogin) {
      const srcIp = log.sourceIp || 'unknown-ip';
      if (!this.failedLogins.has(srcIp)) {
        this.failedLogins.set(srcIp, []);
      }
      
      let attempts = this.failedLogins.get(srcIp);
      attempts.push(now);
      
      const cutoff = new Date(now.getTime() - bruteForceRule.timeWindowMinutes * 60000);
      attempts = attempts.filter(t => t > cutoff);
      this.failedLogins.set(srcIp, attempts);
      
      const count = attempts.length;
      
      if (bruteForceRule.enabled && count >= bruteForceRule.threshold) {
        anomalies.push({
          type: 'BRUTE_FORCE_ATTACK',
          severity: bruteForceRule.severity,
          title: bruteForceRule.name,
          description: `Brute force attack detected from ${srcIp}: ${count} failed attempts in ${bruteForceRule.timeWindowMinutes} minutes`,
          score: bruteForceRule.score, // +40 for brute force
          reasons: [
            `Brute force threshold exceeded: ${count} failed attempts`
          ]
        });
      } else if (count >= 3 && count < bruteForceRule.threshold) {
        anomalies.push({
          type: 'REPEATED_FAILED_LOGIN',
          severity: 'MEDIUM',
          title: 'Multiple Failed Logins',
          description: `Multiple failed login attempts from ${srcIp}: ${count} attempts`,
          score: 20, // +20 for repeated failed login
          reasons: [`Multiple failed authentication events (${count} attempts)`]
        });
      } else {
        anomalies.push({
          type: 'FAILED_LOGIN',
          severity: 'LOW',
          title: 'Failed Login Attempt',
          description: `Failed login attempt from ${srcIp}`,
          score: 10, // +10 for generic failed login
          reasons: [`Failed authentication event`]
        });
      }
    }

    // 3. Unusual Hours
    if (unusualHoursRule.enabled) {
      const hour = log.timestamp.getHours();
      // Hardcoded window for now, could be parsed from string
      if (hour >= 1 && hour <= 5) { 
        if (['sshd', 'sudo', 'login', 'auth'].includes(log.source) || (log.metadata && [4624, 4625, 4672, 4688].includes(log.metadata.eventId))) {
          anomalies.push({
            type: 'UNUSUAL_HOUR_ACCESS',
            severity: unusualHoursRule.severity,
            title: unusualHoursRule.name,
            description: `Suspicious activity during unusual hours (${hour}:00) from ${log.sourceIp || log.user || 'local'}`,
            score: unusualHoursRule.score,
            reasons: [`Activity occurred at unusual hour: ${hour}:00`]
          });
        }
      }
    }

    // 4. Privilege Escalation
    if (privEscRule.enabled) {
      const keywords = ["sudo ", "su ", "chmod 777", "chown root", "setuid"];
      if (keywords.some(k => messageLower.includes(k))) {
        if (['sudo', 'su', 'polkitd'].includes(log.source) || (log.metadata && log.metadata.eventId === 4672)) {
          anomalies.push({
            type: 'PRIVILEGE_ESCALATION',
            severity: privEscRule.severity,
            title: privEscRule.name,
            description: `Privilege escalation attempt by ${log.user || 'unknown'}: ${log.message.substring(0, 100)}`,
            score: privEscRule.score,
            reasons: [`Detected privilege escalation context (sudo/su or Event 4672)`, `Initiated by user: ${log.user || 'unknown'}`]
          });
        }
      }
    }

    // 5. Port Scan
    if (portScanRule.enabled) {
      const portMatch = log.message.match(/port (\d+)/i);
      if (portMatch && log.sourceIp) {
        const port = portMatch[1];
        if (!this.portAccess.has(log.sourceIp)) {
          this.portAccess.set(log.sourceIp, new Map());
        }
        
        const ipPorts = this.portAccess.get(log.sourceIp);
        if (!ipPorts.has(port)) {
          ipPorts.set(port, []);
        }
        
        let accesses = ipPorts.get(port);
        accesses.push(now);
        const cutoff = new Date(now.getTime() - portScanRule.timeWindowMinutes * 60000);
        
        let uniquePorts = 0;
        for (const [p, times] of ipPorts.entries()) {
          const recentTimes = times.filter(t => t > cutoff);
          if (recentTimes.length > 0) {
            ipPorts.set(p, recentTimes);
            uniquePorts++;
          } else {
            ipPorts.delete(p);
          }
        }
        
        if (uniquePorts >= portScanRule.threshold) {
          anomalies.push({
            type: 'PORT_SCAN',
            severity: portScanRule.severity,
            title: portScanRule.name,
            description: `Port scanning detected from ${log.sourceIp}: ${uniquePorts} unique ports accessed`,
            score: portScanRule.score,
            reasons: [
              `${uniquePorts} unique ports accessed`,
              `Same source IP: ${log.sourceIp}`,
              `Activity occurred within ${portScanRule.timeWindowMinutes} minutes`
            ]
          });
        }
      }
    }

    // 6. Admin Direct Login
    if (adminDirectRule.enabled) {
      const isAdminUser = log.user && ['root', 'admin', 'administrator'].includes(log.user.toLowerCase());
      const isLinuxAdminLogin = isAdminUser && ['sshd', 'login'].includes(log.source) && (messageLower.includes('accepted') || messageLower.includes('session opened'));
      const isWindowsAdminLogin = isAdminUser && log.metadata && log.metadata.eventId === 4624;
      
      if (isLinuxAdminLogin || isWindowsAdminLogin) {
        anomalies.push({
          type: 'ADMIN_DIRECT_LOGIN',
          severity: adminDirectRule.severity,
          title: adminDirectRule.name,
          description: `Direct login as ${log.user} from ${log.sourceIp || 'unknown'}`,
          score: adminDirectRule.score,
          reasons: [`Target account is privileged (${log.user})`, `Direct authentication instead of role assumption`]
        });
      }
    }

    // 7. System Crash
    if (messageLower.includes('segfault') || messageLower.includes('segmentation fault')) {
      anomalies.push({
        type: 'SYSTEM_CRASH',
        severity: 'CRITICAL',
        title: 'System Crash Detected',
        description: `Segmentation fault detected: ${log.message.substring(0, 100)}`,
        score: 95,
        reasons: ['Process crash (Segmentation fault)']
      });
    }

    // 8. Account Modifications
    const accountModRule = this.getRule('account-mod');
    if (accountModRule.enabled && log.metadata) {
      if (log.metadata.eventId === 4720) {
        anomalies.push({
          type: 'USER_ACCOUNT_CREATED',
          severity: accountModRule.severity,
          title: 'User Account Created',
          description: `A new user account was created by ${log.user}`,
          score: accountModRule.score,
          reasons: ['Suspicious account modification (User created)']
        });
      } else if (log.metadata.eventId === 4728) {
        anomalies.push({
          type: 'USER_ADDED_TO_GLOBAL_GROUP',
          severity: accountModRule.severity,
          title: 'User Added to Global Group',
          description: `A user was added to a global security group by ${log.user}`,
          score: accountModRule.score,
          reasons: ['Suspicious group modification (Global)']
        });
      } else if (log.metadata.eventId === 4732) {
        anomalies.push({
          type: 'USER_ADDED_TO_LOCAL_GROUP',
          severity: accountModRule.severity,
          title: 'User Added to Local Group',
          description: `A user was added to a local security group by ${log.user}`,
          score: accountModRule.score,
          reasons: ['Suspicious group modification (Local)']
        });
      }
    }

    // 9. Suspicious Process (4688)
    const procRule = this.getRule('suspicious-process');
    if (procRule.enabled && log.metadata && log.metadata.eventId === 4688) {
      const suspiciousProcesses = ['powershell.exe', 'cmd.exe', 'psexec.exe', 'net.exe', 'whoami.exe', 'wmic.exe'];
      if (log.process && suspiciousProcesses.some(p => log.process.toLowerCase().includes(p))) {
        anomalies.push({
          type: 'SUSPICIOUS_PROCESS',
          severity: procRule.severity,
          title: procRule.name,
          description: `Suspicious process ${log.process} created by ${log.user || 'Unknown'}`,
          score: procRule.score,
          reasons: [`Suspicious process execution detected (${log.process})`]
        });
      }
    }

    // Accumulate scores if there are multiple anomalies for the same log
    if (anomalies.length > 0) {
      let finalScore = 0;
      let allReasons = [];
      let maxSeverity = 'LOW';
      let primaryType = '';
      
      const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

      for (const anomaly of anomalies) {
        finalScore += anomaly.score;
        allReasons.push(...anomaly.reasons);
        if (severityOrder[anomaly.severity] >= severityOrder[maxSeverity]) {
          maxSeverity = anomaly.severity;
          primaryType = anomaly.type;
        }
      }

      // Clamp score
      finalScore = Math.min(100, Math.max(0, finalScore));

      // Override severity if score is extremely high due to correlation
      if (finalScore >= 90) maxSeverity = 'CRITICAL';
      else if (finalScore >= 75 && severityOrder[maxSeverity] < 3) maxSeverity = 'HIGH';
      else if (finalScore >= 50 && severityOrder[maxSeverity] < 2) maxSeverity = 'MEDIUM';

      log.isAnomaly = true;
      log.anomalyType = primaryType;
      log.severity = maxSeverity;
      log.threatScore = finalScore;
      log.detectionReasons = allReasons;
    }
    
    return { log, anomalies };
  }

  async createAlerts(log, anomalies) {
    const createdAlerts = [];
    const now = new Date();

    for (const anomaly of anomalies) {
      const recentAlert = await Alert.findOne({
          type: anomaly.type,
          sourceIp: log.sourceIp,
          status: 'ACTIVE',
          createdAt: { $gte: new Date(now.getTime() - 5 * 60000) } // Rate limit duplicates
      });
      
      if (!recentAlert) {
        const alert = new Alert({
          type: anomaly.type,
          title: anomaly.title,
          description: anomaly.description,
          severity: anomaly.severity,
          source: log.source,
          sourceIp: log.sourceIp,
          user: log.user,
          relatedLog: log._id,
          threatScore: anomaly.score !== undefined ? anomaly.score : null, // Prevent fake scores
          detectionReasons: anomaly.reasons || []
        });
        await alert.save();
        createdAlerts.push(alert);
      }
    }
    return createdAlerts;
  }
}

export default new AnomalyEngine();
