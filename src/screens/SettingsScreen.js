import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Switch,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
    const navigation = useNavigation();

    // Settings state
    const [settings, setSettings] = useState({
        notifications: true,
        autoScan: true,
        dataCollection: false,
        riskAlerts: true,
        backgroundScanning: false,
        analyticsSharing: false,
    });

    const toggleSetting = (settingKey) => {
        setSettings(prev => ({
            ...prev,
            [settingKey]: !prev[settingKey]
        }));
    };

    const showAlert = (title, message) => {
        Alert.alert(title, message, [{ text: 'OK' }]);
    };

    const handlePrivacyPolicy = () => {
        showAlert('Privacy Policy', 'This would normally open the privacy policy document or navigate to a privacy policy screen.');
    };

    const handleTermsOfService = () => {
        showAlert('Terms of Service', 'This would normally open the terms of service document.');
    };

    const handleAbout = () => {
        showAlert('About', 'App Privacy Scanner v1.0.0\n\nProtecting your privacy by analyzing app permissions and data usage patterns.');
    };

    const handleDataExport = () => {
        showAlert('Export Data', 'Your app analysis data would be exported to a secure file.');
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setSettings({
                            notifications: true,
                            autoScan: true,
                            dataCollection: false,
                            riskAlerts: true,
                            backgroundScanning: false,
                            analyticsSharing: false,
                        });
                        showAlert('Settings Reset', 'All settings have been reset to default values.');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ title, subtitle, value, onToggle, type = 'switch' }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#ddd', true: '#ff6347' }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                />
            )}
            {type === 'button' && (
                <TouchableOpacity onPress={onToggle} style={styles.settingButton}>
                    <Text style={styles.settingButtonText}>›</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const navigateBack = () => {
        navigation.goBack();
    };

    const SectionHeader = ({ title }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content}>
                {/* Privacy & Security Section */}
                <SectionHeader title="Privacy & Security" />
                <View style={styles.section}>
                    <SettingItem
                        title="Risk Alerts"
                        subtitle="Get notified when high-risk apps are detected"
                        value={settings.riskAlerts}
                        onToggle={() => toggleSetting('riskAlerts')}
                    />
                    <SettingItem
                        title="Background Scanning"
                        subtitle="Continuously monitor app behavior"
                        value={settings.backgroundScanning}
                        onToggle={() => toggleSetting('backgroundScanning')}
                    />
                    <SettingItem
                        title="Data Collection"
                        subtitle="Allow collection of anonymous usage data"
                        value={settings.dataCollection}
                        onToggle={() => toggleSetting('dataCollection')}
                    />
                </View>

                {/* App Behavior Section */}
                <SectionHeader title="App Behavior" />
                <View style={styles.section}>
                    <SettingItem
                        title="Auto Scan"
                        subtitle="Automatically scan new apps when installed"
                        value={settings.autoScan}
                        onToggle={() => toggleSetting('autoScan')}
                    />
                    <SettingItem
                        title="Notifications"
                        subtitle="Enable push notifications"
                        value={settings.notifications}
                        onToggle={() => toggleSetting('notifications')}
                    />
                    <SettingItem
                        title="Analytics Sharing"
                        subtitle="Share anonymous analytics to improve the app"
                        value={settings.analyticsSharing}
                        onToggle={() => toggleSetting('analyticsSharing')}
                    />
                </View>

                {/* Data Management Section */}
                <SectionHeader title="Data Management" />
                <View style={styles.section}>
                    <SettingItem
                        title="Export Data"
                        subtitle="Download your app analysis data"
                        type="button"
                        onToggle={handleDataExport}
                    />
                    <SettingItem
                        title="Reset Settings"
                        subtitle="Restore all settings to default"
                        type="button"
                        onToggle={handleResetSettings}
                    />
                </View>

                {/* Legal & Support Section */}
                <SectionHeader title="Legal & Support" />
                <View style={styles.section}>
                    <SettingItem
                        title="Privacy Policy"
                        subtitle="Read our privacy policy"
                        type="button"
                        onToggle={handlePrivacyPolicy}
                    />
                    <SettingItem
                        title="Terms of Service"
                        subtitle="View terms and conditions"
                        type="button"
                        onToggle={handleTermsOfService}
                    />
                    <SettingItem
                        title="About"
                        subtitle="App version and information"
                        type="button"
                        onToggle={handleAbout}
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoText}>App Privacy Scanner</Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNavBar}>
                <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('Dashboard')}>
                    <Text style={styles.navBarIcon}>🏠</Text>
                    <Text style={styles.navBarText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('AppListScreen')}>
                    <Text style={styles.navBarIcon}>📱</Text>
                    <Text style={styles.navBarText}>Apps</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBarItem, styles.activeNavItem]}>
                    <Text style={styles.navBarIcon}>⚙️</Text>
                    <Text style={[styles.navBarText, styles.activeNavText]}>Settings</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    headerSpacer: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    settingButton: {
        padding: 4,
    },
    settingButtonText: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
    },
    appInfo: {
        alignItems: 'center',
        padding: 24,
        marginTop: 16,
    },
    appInfoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 14,
        color: '#666',
    },
    bottomNavBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 80,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    navBarItem: {
        alignItems: 'center',
        flex: 1,
    },
    activeNavItem: {
        opacity: 1,
    },
    navBarIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    navBarText: {
        fontSize: 12,
        color: '#666',
    },
    activeNavText: {
        color: '#ff6347',
        fontWeight: 'bold',
    },
});

export default SettingsScreen;