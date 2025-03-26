"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    adminEmail: 'admin@example.com',
    notificationEnabled: true,
    autoExportEnabled: false,
    exportFrequency: 'weekly',
    minimumRatingThreshold: 3.5
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement settings update logic
    console.log('Settings updated:', settings);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your admin panel settings and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <Input
                type="email"
                id="adminEmail"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Email Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive email notifications for new ratings and low satisfaction scores
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationEnabled}
                  onChange={(e) => setSettings({ ...settings, notificationEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Automatic Export
                </label>
                <p className="text-sm text-gray-500">
                  Automatically export ratings data on a schedule
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.autoExportEnabled}
                  onChange={(e) => setSettings({ ...settings, autoExportEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.autoExportEnabled && (
              <div>
                <label htmlFor="exportFrequency" className="block text-sm font-medium text-gray-700">
                  Export Frequency
                </label>
                <select
                  id="exportFrequency"
                  value={settings.exportFrequency}
                  onChange={(e) => setSettings({ ...settings, exportFrequency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Rating Threshold Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Threshold Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="minimumRatingThreshold" className="block text-sm font-medium text-gray-700">
                Minimum Rating Threshold
              </label>
              <p className="text-sm text-gray-500">
                Set the minimum rating threshold for triggering notifications
              </p>
              <Input
                type="number"
                id="minimumRatingThreshold"
                min="0"
                max="5"
                step="0.1"
                value={settings.minimumRatingThreshold}
                onChange={(e) => setSettings({ ...settings, minimumRatingThreshold: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
} 