import DetectionRule from '../models/DetectionRule.js';

export const getRules = async (req, res, next) => {
  try {
    const rules = await DetectionRule.find({});
    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

export const getRule = async (req, res, next) => {
  try {
    const rule = await DetectionRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const rule = await DetectionRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const rule = await DetectionRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const rule = await DetectionRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
