import { spawn } from 'child_process';
import fs from 'fs';
import Log from '../models/Log.js';
import SystemSettings from '../models/SystemSettings.js';
import anomalyEngine from './anomalyService.js';
import { broadcast } from '../websocket/websocket.js';

class LogMonitorService {
  constructor() {
    this.processes = [];
    this.running = false;
    this.platform = process.platform === 'win32' ? 'Windows' : 'Linux';
    this.monitoredSources = [];
    this.eventsProcessed = 0;
    this.eventsPerSecond = 0;
    this.recentLatencies = [];
    this.lastEventTimestamp = null;
    
    // Calculate eps every second
    setInterval(() => {
      this.eventsPerSecond = this.eventsProcessed;
      this.eventsProcessed = 0;
    }, 1000);
  }

  async start() {
    if (this.running) return;
    this.running = true;

    // Load settings from DB
    let settings;
    try {
      settings = await SystemSettings.findOne({ singletonKey: 'global' });
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    
    const channels = [];
    if (settings && settings.monitoredChannels) {
      if (settings.monitoredChannels.security) channels.push('Security');
      if (settings.monitoredChannels.system) channels.push('System');
      if (settings.monitoredChannels.application) channels.push('Application');
      if (settings.monitoredChannels.setup) channels.push('Setup');
    } else {
      channels.push('Security', 'System', 'Application'); // Fallback
    }

    const mode = process.env.LOG_SOURCE_MODE || (this.platform === 'Windows' ? 'windows' : 'linux');
    console.log(`[Monitor] Starting log monitor in '${mode}' mode.`);

    if (mode === 'demo') {
      this.startDemoMonitor();
    } else if (mode === 'windows') {
      this.startWindowsMonitor(channels);
    } else if (mode === 'linux') {
      this.startLinuxMonitor();
    } else {
      console.warn(`[Monitor] Unknown mode '${mode}'. Falling back to platform default.`);
      if (this.platform === 'Windows') this.startWindowsMonitor(channels);
      else this.startLinuxMonitor();
    }
  }

  startDemoMonitor() {
    console.log('🚀 Starting API Ingestion (Demo Mode) Monitor...');
    this.monitoredSources = ['API Ingestion'];
    
    // No random generation. 
    // Logs are exclusively ingested via POST /api/logs or /api/monitor/test-log
    // The service is marked as running and ready to process incoming API requests.
    this.processes.push({
      kill: () => { console.log('API Ingestion Monitor stopped.'); }
    });
  }

  stop() {
    this.running = false;
    this.processes.forEach(p => p.kill());
    this.processes = [];
    this.monitoredSources = [];
    this.eventsPerSecond = 0;
    console.log('🛑 Log monitoring stopped.');
  }

  status() {
    const avgLatency = this.recentLatencies.length > 0 
      ? this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length 
      : 0;
      
    return {
      running: this.running,
      platform: this.platform,
      sources: this.monitoredSources,
      eventsPerSecond: this.eventsPerSecond,
      averageLatencyMs: Math.round(avgLatency),
      lastEventTimestamp: this.lastEventTimestamp
    };
  }

  async startWindowsMonitor(channels) {
    if (channels.length === 0) {
      console.error('No Windows Event Channels enabled in settings.');
      this.running = false;
      return;
    }

    console.log(`🚀 Starting Windows Event Log Monitor for: ${channels.join(', ')}...`);
    this.monitoredSources = channels.map(c => `Windows ${c}`);
    
    // Find the last recorded Windows event to resume from, avoiding duplicates
    // We only go back a maximum of 1 hour on startup to avoid freezing
    const oneHourAgo = new Date(Date.now() - 3600000);
    const lastWinLog = await Log.findOne({ source: /^Windows/ }).sort({ timestamp: -1 });
    
    let startTimeStr = `[datetime]"${oneHourAgo.toISOString()}"`;
    if (lastWinLog && lastWinLog.timestamp && lastWinLog.timestamp > oneHourAgo) {
      startTimeStr = `[datetime]"${new Date(lastWinLog.timestamp.getTime() + 1).toISOString()}"`;
    }

    const channelFilter = channels.map(c => `'${c}'`).join(',');
    const script = `
      $lastTime = ${startTimeStr}
      while ($true) {
        try {
          $events = Get-WinEvent -FilterHashtable @{LogName=${channelFilter}; StartTime=$lastTime} -ErrorAction Stop | Sort-Object TimeCreated
          if ($events) {
            $lastTime = $events[-1].TimeCreated.AddTicks(1)
            foreach ($event in $events) {
              $obj = [ordered]@{
                TimeCreated = $event.TimeCreated.ToString('o')
                LogName = $event.LogName
                LevelDisplayName = $event.LevelDisplayName
                Message = $event.Message
                Id = $event.Id
                RecordId = $event.RecordId
                MachineName = $event.MachineName
                ProviderName = $event.ProviderName
              }
              Write-Output ($obj | ConvertTo-Json -Compress)
            }
          }
        } catch {
          Write-Error $_.Exception.Message
          Start-Sleep -Seconds 10
        }
        Start-Sleep -Seconds 2
      }
    `;

    const ps = spawn('powershell', ['-NoProfile', '-Command', script]);
    this.processes.push(ps);

    let buffer = '';

    ps.stdout.on('data', async (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the last partial line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line.trim());
          await this.ingestWindowsEvent(event);
        } catch (err) {
          // JSON parse error, ignore
        }
      }
    });

    ps.stderr.on('data', (data) => {
      console.error(`PowerShell Error: ${data.toString()}`);
    });
    
    ps.on('close', (code) => {
      console.log(`Windows monitor process exited with code ${code}`);
      if (this.running) {
        setTimeout(() => this.startWindowsMonitor(channels), 5000);
      }
    });
  }

  startLinuxMonitor() {
    console.log('🚀 Starting Linux Log Monitor...');
    // A simplified Linux fallback tailing /var/log/syslog and /var/log/auth.log
    this.monitoredSources = ['/var/log/syslog', '/var/log/auth.log'];
    const validSources = this.monitoredSources.filter(src => fs.existsSync(src));

    if (validSources.length === 0) {
      console.log('⚠️ No syslog files found. Falling back to journalctl for Linux monitoring...');
      this.monitoredSources = ['journalctl'];
      const ps = spawn('journalctl', ['-f', '-o', 'short']);
      this.processes.push(ps);
      
      ps.stdout.on('data', async (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (!line.trim() || line.startsWith('--')) continue;
          await this.ingestLinuxLine(line);
        }
      });
      return;
    }

    const ps = spawn('tail', ['-F', ...validSources]);
    this.processes.push(ps);
    
    ps.stdout.on('data', async (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (!line.trim() || line.startsWith('==>')) continue;
        await this.ingestLinuxLine(line);
      }
    });
  }

  async ingestWindowsEvent(event) {
    const ingestStart = Date.now();
    
    if (event.RecordId) {
      // Improved deduplication
      const exists = await Log.exists({ 
        'metadata.recordId': event.RecordId, 
        'metadata.channel': event.LogName,
        hostname: event.MachineName
      });
      if (exists) return;
    }

    // Map Windows Event to our Log schema
    let level = 'INFO';
    if (['Error', 'Critical'].includes(event.LevelDisplayName)) level = 'ERROR';
    if (['Warning'].includes(event.LevelDisplayName)) level = 'WARNING';

    // Simple heuristic for user/ip/process extraction from message
    let sourceIp = null;
    let user = null;
    let processName = null;
    
    const ipMatch = event.Message?.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/);
    if (ipMatch) sourceIp = ipMatch[0];
    
    // Improved user matching for Windows Events
    const userMatch = event.Message?.match(/Account Name:\s+([^\s]+)/i);
    if (userMatch && userMatch[1] !== '-' && !userMatch[1].endsWith('$')) {
      user = userMatch[1];
    } else {
      const targetUserMatch = event.Message?.match(/TargetUserName:\s+([^\s]+)/i);
      if (targetUserMatch && targetUserMatch[1] !== '-') {
        user = targetUserMatch[1];
      }
    }

    if (event.Id === 4688) {
       const procMatch = event.Message?.match(/New Process Name:\s+([^\s]+)/i);
       if (procMatch) processName = procMatch[1];
    }

    const logEntry = new Log({
      timestamp: new Date(event.TimeCreated),
      source: `Windows ${event.LogName}`,
      level: level,
      message: event.Message?.substring(0, 1000) || `Event ID: ${event.Id}`,
      hostname: event.MachineName,
      sourceIp: sourceIp,
      user: user,
      eventType: event.ProviderName,
      process: processName,
      metadata: {
        eventId: event.Id,
        provider: event.ProviderName,
        channel: event.LogName,
        recordId: event.RecordId
      }
    });

    await this.processAndBroadcast(logEntry, ingestStart);
  }

  async ingestLinuxLine(line) {
    const ingestStart = Date.now();
    let level = 'INFO';
    const messageUpper = line.toUpperCase();
    if (messageUpper.includes('ERROR') || messageUpper.includes('FAILED') || messageUpper.includes('FATAL')) level = 'ERROR';
    if (messageUpper.includes('WARN')) level = 'WARNING';

    let sourceIp = null;
    let user = null;
    const ipMatch = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    if (ipMatch) sourceIp = ipMatch[0];
    const userMatch = line.match(/(?:user|for)\s+(\S+)/i);
    if (userMatch && userMatch[1] !== 'invalid') user = userMatch[1];

    const logEntry = new Log({
      timestamp: new Date(),
      source: 'Linux Syslog',
      level: level,
      message: line.substring(0, 1000),
      sourceIp: sourceIp,
      user: user
    });

    await this.processAndBroadcast(logEntry, ingestStart);
  }

  async processAndBroadcast(logEntry, ingestStart = Date.now()) {
    try {
      // Analyze the log for anomalies
      const { log, anomalies } = await anomalyEngine.analyze(logEntry);
      
      // SAVE LOG EXACTLY ONCE
      await log.save();

      // Create alerts if there are anomalies
      let alerts = [];
      if (anomalies && anomalies.length > 0) {
        alerts = await anomalyEngine.createAlerts(log, anomalies);
      }

      this.eventsProcessed++;
      this.lastEventTimestamp = log.timestamp;

      // Track latency
      const latency = Date.now() - ingestStart;
      this.recentLatencies.push(latency);
      if (this.recentLatencies.length > 100) this.recentLatencies.shift();

      // Broadcast new log (Include details required by frontend)
      broadcast('log', {
        id: log._id.toString(),
        timestamp: log.timestamp.toISOString(),
        source: log.source,
        level: log.level,
        message: log.message,
        hostname: log.hostname,
        source_ip: log.sourceIp,
        user: log.user,
        is_anomaly: log.isAnomaly,
        anomaly_type: log.anomalyType,
        severity: log.severity,
        threatScore: log.threatScore,
        detectionReasons: log.detectionReasons,
        process: log.process,
        metadata: log.metadata
      });

      // Broadcast alerts
      for (const alert of alerts) {
        broadcast('alert', {
          id: alert._id.toString(),
          timestamp: alert.detectedAt.toISOString(),
          anomaly_type: alert.type,
          severity: alert.severity,
          description: alert.description,
          source_ip: alert.sourceIp,
          user: alert.user,
          threatScore: alert.threatScore
        });
      }
    } catch (err) {
      console.error('Error processing log entry:', err);
    }
  }
}

export default new LogMonitorService();
