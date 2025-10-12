import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useAppInfo } from '../../hooks/useAppInfo';

const RecentAppsDebug = () => {
    const { getInstalledApps, getRecentApps, appDataService } = useAppInfo();
    const [allApps, setAllApps] = useState([]);
    const [recentApps, setRecentApps] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkPermissionAndLoadApps = useCallback(async () => {
        setLoading(true);
        try {
            // Check usage stats permission
            const permission = await appDataService.checkUsageStatsPermission();
            setHasPermission(permission);
            console.log('Debug: Usage stats permission:', permission);

            // Load all apps
            const apps = await getInstalledApps();
            setAllApps(apps);
            console.log('Debug: Total apps loaded:', apps.length);

            // Get recent apps
            const recent = getRecentApps(apps, 10);
            setRecentApps(recent);
            console.log('Debug: Recent apps found:', recent.length);

            // Log detailed info about apps
            apps.slice(0, 5).forEach((app, index) => {
                console.log(`Debug App ${index + 1}:`, {
                    name: app.appName || app.name,
                    package: app.packageName,
                    lastUsed: app.lastTimeUsed || app.lastUsedTimestamp || 0,
                    totalTime: app.totalTimeInForeground || 0,
                    launchCount: app.launchCount || 0,
                    hasNetworkUsage: !!(app.dataUsage && app.dataUsage.total > 0),
                    networkTotal: app.dataUsage?.total || 0,
                    firstInstall: app.firstInstallTime,
                });
            });
        } catch (error) {
            console.error('Debug: Error loading apps:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }, [getInstalledApps, getRecentApps, appDataService]);

    const requestPermission = async () => {
        try {
            await appDataService.requestUsageStatsPermission();
            Alert.alert(
                'Permission Required',
                'Please grant Usage Access permission in Settings, then come back and tap "Refresh" to see usage data.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to request permission: ' + error.message);
        }
    };

    useEffect(() => {
        checkPermissionAndLoadApps();
    }, [checkPermissionAndLoadApps]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Recent Apps Debug</Text>

            <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                    Usage Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}
                </Text>
                <Text style={styles.infoText}>Total Apps: {allApps.length}</Text>
                <Text style={styles.infoText}>Recent Apps Found: {recentApps.length}</Text>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={checkPermissionAndLoadApps}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Refresh'}
                    </Text>
                </TouchableOpacity>

                {!hasPermission && (
                    <TouchableOpacity
                        style={[styles.button, styles.permissionButton]}
                        onPress={requestPermission}
                    >
                        <Text style={styles.buttonText}>Request Permission</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.sectionTitle}>Recent Apps ({recentApps.length})</Text>
            {recentApps.map((app, index) => (
                <View key={app.packageName} style={styles.appItem}>
                    <Text style={styles.appName}>{app.appName || app.name}</Text>
                    <Text style={styles.appPackage}>{app.packageName}</Text>
                    <Text style={styles.appDetails}>
                        Last Used: {app.lastTimeUsed || app.lastUsedTimestamp || 0}
                        {app.lastTimeUsed > 0 ?
                            ` (${new Date(app.lastTimeUsed).toLocaleDateString()})` :
                            ' (No usage data)'
                        }
                    </Text>
                    <Text style={styles.appDetails}>
                        Network Usage: {app.dataUsage?.total || 0} bytes
                    </Text>
                    <Text style={styles.appDetails}>
                        Foreground Time: {app.totalTimeInForeground || 0}ms
                    </Text>
                    <Text style={styles.appDetails}>
                        Launch Count: {app.launchCount || 0}
                    </Text>
                </View>
            ))}

            {recentApps.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No recent apps found. This could be because:
                    </Text>
                    <Text style={styles.emptyReason}>
                        • Usage Access permission is not granted
                    </Text>
                    <Text style={styles.emptyReason}>
                        • No apps have been used recently
                    </Text>
                    <Text style={styles.emptyReason}>
                        • Apps don't meet the filtering criteria
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 4,
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    button: {
        flex: 1,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    permissionButton: {
        backgroundColor: '#ffc107',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    appItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    appName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    appPackage: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    appDetails: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    emptyState: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyReason: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
        textAlign: 'left',
        alignSelf: 'stretch',
    },
});

export default RecentAppsDebug;
