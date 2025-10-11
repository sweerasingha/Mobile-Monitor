package com.mobilemonitor

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.pm.PackageInfo
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.text.SimpleDateFormat
import java.util.*

class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InstalledApps"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val installedPackages = packageManager.getInstalledPackages(PackageManager.GET_PERMISSIONS)
            val apps = WritableNativeArray()

            for (packageInfo in installedPackages) {
                val appInfo = packageInfo.applicationInfo ?: continue
                // Skip system apps unless they are user-installed
                if ((appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0 ||
                    (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0) {
                    
                    val appInfoMap = WritableNativeMap()
                    
                    try {
                        val appName = packageManager.getApplicationLabel(appInfo).toString()
                        appInfoMap.putString("appName", appName)
                        appInfoMap.putString("packageName", packageInfo.packageName)
                        appInfoMap.putString("versionName", packageInfo.versionName ?: "Unknown")
                        appInfoMap.putInt("versionCode", packageInfo.versionCode)
                        
                        // Get install date
                        appInfoMap.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
                        appInfoMap.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
                        
                        // Get permissions
                        val permissions = WritableNativeArray()
                        packageInfo.requestedPermissions?.forEach { permission ->
                            // Only include dangerous permissions that users should be aware of
                            if (isDangerousPermission(permission)) {
                                permissions.pushString(getSimplePermissionName(permission))
                            }
                        }
                        appInfoMap.putArray("permissions", permissions)
                        
                        // Get app icon as base64
                        try {
                            val drawable = packageManager.getApplicationIcon(appInfo)
                            val bitmap = drawableToBitmap(drawable)
                            val base64Icon = bitmapToBase64(bitmap)
                            appInfoMap.putString("icon", base64Icon)
                        } catch (e: Exception) {
                            appInfoMap.putString("icon", "default")
                        }
                        
                        // Get app size information
                        try {
                            val sourceDir = appInfo.sourceDir
                            val apkFile = java.io.File(sourceDir)
                            val appSize = if (apkFile.exists()) apkFile.length() else 0L
                            appInfoMap.putDouble("size", appSize.toDouble())
                        } catch (e: Exception) {
                            // Fallback: estimate size based on app type
                            val estimatedSize = when {
                                appName.contains("Game", ignoreCase = true) -> 100 * 1024 * 1024L // 100MB for games
                                permissions.toArrayList().size > 5 -> 50 * 1024 * 1024L // 50MB for feature-rich apps
                                else -> 25 * 1024 * 1024L // 25MB for simple apps
                            }
                            appInfoMap.putDouble("size", estimatedSize.toDouble())
                        }
                        
                        // Try to get usage stats (requires special permission)
                        val usageStats = getUsageStats(packageInfo.packageName)
                        appInfoMap.putDouble("lastTimeUsed", usageStats.toDouble())
                        appInfoMap.putDouble("totalTimeInForeground", 0.0) // Placeholder
                        
                        apps.pushMap(appInfoMap)
                    } catch (e: Exception) {
                        // Skip this app if there's an error getting its info
                        continue
                    }
                }
            }
            
            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("GET_APPS_ERROR", "Failed to get installed apps: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAppDetails(packageName: String, promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packageInfo = packageManager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
            val applicationInfo = packageInfo.applicationInfo ?: throw Exception("Application info not found")
            
            val appInfo = WritableNativeMap()
            val appName = packageManager.getApplicationLabel(applicationInfo).toString()
            
            appInfo.putString("appName", appName)
            appInfo.putString("packageName", packageName)
            appInfo.putString("versionName", packageInfo.versionName ?: "Unknown")
            appInfo.putInt("versionCode", packageInfo.versionCode)
            appInfo.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
            appInfo.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
            
            // Get detailed permissions
            val permissions = WritableNativeArray()
            val permissionDetails = WritableNativeArray()
            
            packageInfo.requestedPermissions?.forEachIndexed { index, permission ->
                if (isDangerousPermission(permission)) {
                    permissions.pushString(getSimplePermissionName(permission))
                    
                    val permDetail = WritableNativeMap()
                    permDetail.putString("name", getSimplePermissionName(permission))
                    permDetail.putString("fullName", permission)
                    permDetail.putString("description", getPermissionDescription(permission))
                    permDetail.putString("riskLevel", getPermissionRiskLevel(permission))
                    
                    // Check if permission is granted
                    val isGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        packageManager.checkPermission(permission, packageName) == PackageManager.PERMISSION_GRANTED
                    } else {
                        true // Pre-M permissions were granted at install time
                    }
                    permDetail.putBoolean("isGranted", isGranted)
                    
                    permissionDetails.pushMap(permDetail)
                }
            }
            
            appInfo.putArray("permissions", permissions)
            appInfo.putArray("permissionDetails", permissionDetails)
            
            promise.resolve(appInfo)
        } catch (e: Exception) {
            promise.reject("GET_APP_DETAILS_ERROR", "Failed to get app details: ${e.message}", e)
        }
    }

    private fun isDangerousPermission(permission: String): Boolean {
        return when {
            permission.contains("CAMERA") -> true
            permission.contains("LOCATION") -> true
            permission.contains("MICROPHONE") || permission.contains("RECORD_AUDIO") -> true
            permission.contains("CONTACTS") -> true
            permission.contains("PHONE") -> true
            permission.contains("SMS") -> true
            permission.contains("CALENDAR") -> true
            permission.contains("STORAGE") || permission.contains("READ_EXTERNAL") || permission.contains("WRITE_EXTERNAL") -> true
            permission.contains("BODY_SENSORS") -> true
            else -> false
        }
    }

    private fun getSimplePermissionName(permission: String): String {
        return when {
            permission.contains("CAMERA") -> "CAMERA"
            permission.contains("ACCESS_FINE_LOCATION") || permission.contains("ACCESS_COARSE_LOCATION") -> "LOCATION"
            permission.contains("RECORD_AUDIO") -> "MICROPHONE"
            permission.contains("READ_CONTACTS") || permission.contains("WRITE_CONTACTS") -> "CONTACTS"
            permission.contains("READ_PHONE") || permission.contains("CALL_PHONE") -> "PHONE"
            permission.contains("SEND_SMS") || permission.contains("READ_SMS") -> "SMS"
            permission.contains("READ_CALENDAR") || permission.contains("WRITE_CALENDAR") -> "CALENDAR"
            permission.contains("READ_EXTERNAL_STORAGE") || permission.contains("WRITE_EXTERNAL_STORAGE") -> "STORAGE"
            permission.contains("BODY_SENSORS") -> "SENSORS"
            else -> permission.substringAfterLast(".")
        }
    }

    private fun getPermissionDescription(permission: String): String {
        return when {
            permission.contains("CAMERA") -> "Access to device camera for taking photos and videos"
            permission.contains("LOCATION") -> "Access to device location for location-based services"
            permission.contains("RECORD_AUDIO") -> "Access to microphone for recording audio"
            permission.contains("CONTACTS") -> "Access to contacts stored on the device"
            permission.contains("PHONE") -> "Access to phone features and phone state"
            permission.contains("SMS") -> "Access to SMS messages"
            permission.contains("CALENDAR") -> "Access to calendar events"
            permission.contains("STORAGE") -> "Access to files stored on the device"
            permission.contains("BODY_SENSORS") -> "Access to body sensors like heart rate monitors"
            else -> "System permission"
        }
    }

    private fun getPermissionRiskLevel(permission: String): String {
        return when {
            permission.contains("CAMERA") || permission.contains("LOCATION") || permission.contains("RECORD_AUDIO") -> "HIGH"
            permission.contains("CONTACTS") || permission.contains("PHONE") || permission.contains("SMS") -> "HIGH"
            permission.contains("STORAGE") || permission.contains("CALENDAR") -> "MEDIUM"
            permission.contains("BODY_SENSORS") -> "MEDIUM"
            else -> "LOW"
        }
    }

    private fun getUsageStats(packageName: String): Long {
        return try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance()
            calendar.add(Calendar.DAY_OF_YEAR, -1)
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val usageStatsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val usageStat = usageStatsList?.find { it.packageName == packageName }
            usageStat?.lastTimeUsed ?: 0L
        } catch (e: Exception) {
            0L
        }
    }

    private fun drawableToBitmap(drawable: android.graphics.drawable.Drawable): android.graphics.Bitmap {
        if (drawable is android.graphics.drawable.BitmapDrawable) {
            return drawable.bitmap
        }

        val bitmap = android.graphics.Bitmap.createBitmap(
            drawable.intrinsicWidth.takeIf { it > 0 } ?: 96,
            drawable.intrinsicHeight.takeIf { it > 0 } ?: 96,
            android.graphics.Bitmap.Config.ARGB_8888
        )
        val canvas = android.graphics.Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }

    private fun bitmapToBase64(bitmap: android.graphics.Bitmap): String {
        val byteArrayOutputStream = java.io.ByteArrayOutputStream()
        bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 80, byteArrayOutputStream)
        val byteArray = byteArrayOutputStream.toByteArray()
        return "data:image/png;base64," + android.util.Base64.encodeToString(byteArray, android.util.Base64.DEFAULT)
    }
}