import { NativeModules, Platform } from 'react-native';
import appCategorization from '../utils/appCategorization';
import { PermissionService } from './PermissionService';

const { InstalledApps } = NativeModules;

// Fallback mock data for development/testing
const mockInstalledApps = [
    {
        id: '1',
        name: 'Facebook',
        icon: require('../assets/icons/facebook.png'),
        packageName: 'com.facebook.katana',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 10,
        permissions: ['CAMERA', 'LOCATION', 'CONTACTS', 'STORAGE', 'MICROPHONE'],
        category: 'Social',
        installDate: '2023-01-15',
        version: '1.0.0',
        totalTimeInForeground: 3600000,
    },
    {
        id: '2',
        name: 'Instagram',
        icon: require('../assets/icons/instagram.png'),
        packageName: 'com.instagram.android',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 30,
        permissions: ['CAMERA', 'LOCATION', 'CONTACTS', 'STORAGE'],
        category: 'Social',
        installDate: '2023-02-10',
        version: '2.0.0',
        totalTimeInForeground: 2400000,
    },
    {
        id: '3',
        name: 'WhatsApp',
        icon: 'default',
        packageName: 'com.whatsapp',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 5,
        permissions: ['CAMERA', 'CONTACTS', 'STORAGE', 'MICROPHONE'],
        category: 'Communication',
        installDate: '2023-01-20',
        version: '2.23.14.74',
        totalTimeInForeground: 5400000,
    },
    {
        id: '4',
        name: 'Netflix',
        icon: 'default',
        packageName: 'com.netflix.mediaclient',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 60 * 2,
        permissions: ['STORAGE', 'NETWORK'],
        category: 'Entertainment',
        installDate: '2023-03-05',
        version: '8.65.0',
        totalTimeInForeground: 7200000,
    },
    {
        id: '5',
        name: 'Spotify',
        icon: 'default',
        packageName: 'com.spotify.music',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 45,
        permissions: ['STORAGE', 'NETWORK', 'MICROPHONE'],
        category: 'Music',
        installDate: '2023-02-15',
        version: '8.8.32.488',
        totalTimeInForeground: 4800000,
    },
    {
        id: '6',
        name: 'Microsoft Outlook',
        icon: 'default',
        packageName: 'com.microsoft.office.outlook',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 120,
        permissions: ['CONTACTS', 'CALENDAR', 'STORAGE'],
        category: 'Productivity',
        installDate: '2023-01-30',
        version: '4.2328.1',
        totalTimeInForeground: 3600000,
    },
    {
        id: '7',
        name: 'YouTube',
        icon: 'default',
        packageName: 'com.google.android.youtube',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 15,
        permissions: ['CAMERA', 'MICROPHONE', 'STORAGE'],
        category: 'Entertainment',
        installDate: '2023-01-10',
        version: '18.29.34',
        totalTimeInForeground: 9600000,
    },
    {
        id: '8',
        name: 'Telegram',
        icon: 'default',
        packageName: 'org.telegram.messenger',
        lastUsedTimestamp: Date.now() - 1000 * 60 * 60,
        permissions: ['CONTACTS', 'STORAGE', 'MICROPHONE', 'CAMERA'],
        category: 'Communication',
        installDate: '2023-02-01',
        version: '9.9.2',
        totalTimeInForeground: 4200000,
    },
];

export class AppDataService {
    constructor() {
        this.useMockData = !InstalledApps; // Use mock data if native module is not available
    }

    async getInstalledApps() {
        console.log('AppDataService: getInstalledApps called');
        console.log('AppDataService: useMockData =', this.useMockData);
        console.log('AppDataService: InstalledApps module =', InstalledApps);

        if (this.useMockData) {
            console.warn('Using mock data - native module not available');
            return this.processMockData(mockInstalledApps);
        }

        if (Platform.OS === 'android') {
            return await this.getAndroidApps();
        } else if (Platform.OS === 'ios') {
            return await this.getIOSApps();
        } else {
            throw new Error('Unsupported platform');
        }
    }

    async getAndroidApps() {
        console.log('AppDataService: getAndroidApps called');
        try {
            console.log('AppDataService: Calling InstalledApps.getInstalledApps()');
            const rawApps = await InstalledApps.getInstalledApps();
            console.log('AppDataService: Raw apps received:', rawApps?.length || 0, 'apps');
            if (rawApps && rawApps.length > 0) {
                console.log('AppDataService: Sample app:', rawApps[0]);
            }
            return this.processAppData(rawApps);
        } catch (error) {
            console.error('Error getting Android apps:', error);
            // Fallback to mock data if native module fails
            console.warn('Falling back to mock data due to native module error');
            return this.processMockData(mockInstalledApps);
        }
    }

    async getIOSApps() {
        try {
            const apps = await InstalledApps.getInstalledApps();
            return this.processAppData(apps);
        } catch (error) {
            console.error('Error getting iOS apps:', error);
            // iOS doesn't have extensive app monitoring capabilities
            // Return limited mock data
            return this.processMockData(mockInstalledApps.slice(0, 3));
        }
    }

    processAppData(rawApps) {
        return rawApps.map(app => {
            const processedApp = {
                id: app.packageName || app.bundleId || `app_${Date.now()}_${Math.random()}`,
                name: app.appName || 'Unknown App',
                icon: app.icon || 'default', // Base64 icon from native module
                packageName: app.packageName || app.bundleId,
                lastUsedTimestamp: app.lastTimeUsed || Date.now() - Math.random() * 86400000, // Fallback to recent time
                permissions: app.permissions || [],
                category: appCategorization.categorizeApp(app.packageName, app.appName),
                installDate: app.firstInstallTime ? new Date(app.firstInstallTime).toISOString() : null,
                version: app.versionName || 'Unknown',
                totalTimeInForeground: app.totalTimeInForeground || 0,
                size: app.size || null, // App size in bytes from native module
            };

            // Add risk analysis
            processedApp.riskAnalysis = PermissionService.analyzeAppRisk(processedApp.permissions);

            return processedApp;
        });
    }

    processMockData(mockApps) {
        return mockApps.map(app => {
            const processedApp = {
                ...app,
                lastUsedTimestamp: app.lastUsedTimestamp || Date.now() - Math.random() * 86400000, // Ensure recent timestamp
                riskAnalysis: PermissionService.analyzeAppRisk(app.permissions),
            };
            return processedApp;
        });
    }

    async getAppDetails(packageName) {
        if (this.useMockData) {
            const mockApp = mockInstalledApps.find(app => app.packageName === packageName);
            if (mockApp) {
                return {
                    ...mockApp,
                    permissionDetails: PermissionService.getPermissionAnalysis(mockApp.permissions),
                };
            }
            return null;
        }

        try {
            const appDetails = await InstalledApps.getAppDetails(packageName);
            return {
                ...appDetails,
                permissionDetails: PermissionService.getPermissionAnalysis(appDetails.permissions || []),
            };
        } catch (error) {
            console.error('Error getting app details:', error);
            return null;
        }
    }

    /**
     * Get apps categorized by risk level
     */
    categorizeAppsByRisk(apps) {
        const categories = {
            highRisk: [],
            mediumRisk: [],
            lowRisk: [],
            noRisk: [],
        };

        apps.forEach(app => {
            switch (app.riskAnalysis?.riskLevel) {
                case 'HIGH_RISK':
                    categories.highRisk.push(app);
                    break;
                case 'MEDIUM_RISK':
                    categories.mediumRisk.push(app);
                    break;
                case 'LOW_RISK':
                    categories.lowRisk.push(app);
                    break;
                default:
                    categories.noRisk.push(app);
            }
        });

        return categories;
    }

    /**
     * Get recently used apps
     */
    getRecentApps(apps, limit = 5) {
        return apps
            .filter(app => app.lastUsedTimestamp)
            .sort((a, b) => (b.lastUsedTimestamp || 0) - (a.lastUsedTimestamp || 0))
            .slice(0, limit);
    }

    /**
     * Search apps by name or package name
     */
    searchApps(apps, query) {
        if (!query) {
            return apps;
        }

        const lowercaseQuery = query.toLowerCase();
        return apps.filter(app =>
            app.name.toLowerCase().includes(lowercaseQuery) ||
            app.packageName.toLowerCase().includes(lowercaseQuery)
        );
    }

    /**
     * Get apps by category
     */
    getAppsByCategory(apps, category) {
        return apps.filter(app => app.category === category);
    }

    /**
     * Get system statistics
     */
    getSystemStats(apps) {
        const totalApps = apps.length;
        const riskDistribution = this.categorizeAppsByRisk(apps);

        return {
            totalApps,
            highRiskApps: riskDistribution.highRisk.length,
            mediumRiskApps: riskDistribution.mediumRisk.length,
            lowRiskApps: riskDistribution.lowRisk.length,
            safeApps: riskDistribution.noRisk.length,
            riskPercentage: Math.round((riskDistribution.highRisk.length / totalApps) * 100) || 0,
        };
    }
}