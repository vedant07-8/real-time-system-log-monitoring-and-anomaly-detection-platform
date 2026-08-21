import SystemSettings from '../models/SystemSettings.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ singletonKey: 'global' });
    if (!settings) {
      settings = await SystemSettings.create({ singletonKey: 'global' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      { singletonKey: 'global' },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
