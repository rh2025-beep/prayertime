package com.prayertimes.app;

import android.content.Context;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.view.Display;
import android.view.Surface;
import android.view.WindowManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Compass")
public class CompassPlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor rotationVectorSensor;
    private Sensor magneticFieldSensor;
    private Sensor accelerometerSensor;

    private boolean isListening = false;
    private boolean useTrueNorth = true;
    private double userLat = 0.0;
    private double userLng = 0.0;
    private double userAlt = 0.0;

    private String sensorAccuracyStatus = "medium";
    private float declination = 0.0f;
    private float lastAzimuth = 0.0f;

    // Fallback sensor arrays if TYPE_ROTATION_VECTOR is unavailable
    private float[] gravityValues = new float[3];
    private float[] geomagneticValues = new float[3];
    private boolean hasGravity = false;
    private boolean hasGeomagnetic = false;

    @Override
    public void load() {
        Context context = getContext();
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            rotationVectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            magneticFieldSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
            accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }
    }

    @PluginMethod
    public void startCompass(PluginCall call) {
        if (sensorManager == null) {
            call.reject("SensorManager is not available on this device");
            return;
        }

        if (call.hasOption("lat") && call.hasOption("lng")) {
            userLat = call.getDouble("lat", 0.0);
            userLng = call.getDouble("lng", 0.0);
            userAlt = call.getDouble("alt", 0.0);
            updateDeclination();
        }

        if (call.hasOption("trueNorth")) {
            useTrueNorth = call.getBoolean("trueNorth", true);
        }

        registerListeners();
        isListening = true;

        JSObject result = new JSObject();
        result.put("started", true);
        result.put("hasRotationVector", rotationVectorSensor != null);
        result.put("declination", declination);
        call.resolve(result);
    }

    @PluginMethod
    public void stopCompass(PluginCall call) {
        unregisterListeners();
        isListening = false;
        JSObject result = new JSObject();
        result.put("stopped", true);
        call.resolve(result);
    }

    @PluginMethod
    public void setTrueNorth(PluginCall call) {
        if (call.hasOption("enable")) {
            useTrueNorth = call.getBoolean("enable", true);
        }
        if (call.hasOption("lat") && call.hasOption("lng")) {
            userLat = call.getDouble("lat", 0.0);
            userLng = call.getDouble("lng", 0.0);
            userAlt = call.getDouble("alt", 0.0);
            updateDeclination();
        }
        JSObject result = new JSObject();
        result.put("useTrueNorth", useTrueNorth);
        result.put("declination", declination);
        call.resolve(result);
    }

    private void registerListeners() {
        if (sensorManager == null) return;
        unregisterListeners();

        if (rotationVectorSensor != null) {
            sensorManager.registerListener(this, rotationVectorSensor, SensorManager.SENSOR_DELAY_GAME);
        } else if (accelerometerSensor != null && magneticFieldSensor != null) {
            sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_GAME);
            sensorManager.registerListener(this, magneticFieldSensor, SensorManager.SENSOR_DELAY_GAME);
        }

        if (magneticFieldSensor != null) {
            sensorManager.registerListener(this, magneticFieldSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    private void unregisterListeners() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    private void updateDeclination() {
        if (userLat != 0.0 || userLng != 0.0) {
            long time = System.currentTimeMillis();
            GeomagneticField geomagneticField = new GeomagneticField(
                (float) userLat,
                (float) userLng,
                (float) userAlt,
                time
            );
            declination = geomagneticField.getDeclination();
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (!isListening) return;

        if (event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
            processRotationVector(event.values);
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, gravityValues, 0, 3);
            hasGravity = true;
            if (hasGeomagnetic && rotationVectorSensor == null) {
                processAccelerometerAndMagnetometer();
            }
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, geomagneticValues, 0, 3);
            hasGeomagnetic = true;
            if (hasGravity && rotationVectorSensor == null) {
                processAccelerometerAndMagnetometer();
            }
        }
    }

    private void processRotationVector(float[] vectorValues) {
        float[] rotationMatrix = new float[9];
        SensorManager.getRotationMatrixFromVector(rotationMatrix, vectorValues);
        float[] remappedMatrix = remapRotationMatrixForDisplay(rotationMatrix);

        float[] orientation = new float[3];
        SensorManager.getOrientation(remappedMatrix, orientation);

        float azimuthRad = orientation[0];
        float pitchRad = orientation[1];
        float rollRad = orientation[2];

        float magneticAzimuth = (float) Math.toDegrees(azimuthRad);
        magneticAzimuth = (magneticAzimuth + 360f) % 360f;

        dispatchUpdate(magneticAzimuth, (float) Math.toDegrees(pitchRad), (float) Math.toDegrees(rollRad));
    }

    private void processAccelerometerAndMagnetometer() {
        float[] rotationMatrix = new float[9];
        float[] inclinationMatrix = new float[9];
        boolean success = SensorManager.getRotationMatrix(rotationMatrix, inclinationMatrix, gravityValues, geomagneticValues);

        if (success) {
            float[] remappedMatrix = remapRotationMatrixForDisplay(rotationMatrix);
            float[] orientation = new float[3];
            SensorManager.getOrientation(remappedMatrix, orientation);

            float magneticAzimuth = (float) Math.toDegrees(orientation[0]);
            magneticAzimuth = (magneticAzimuth + 360f) % 360f;

            dispatchUpdate(magneticAzimuth, (float) Math.toDegrees(orientation[1]), (float) Math.toDegrees(orientation[2]));
        }
    }

    private float[] remapRotationMatrixForDisplay(float[] rotationMatrix) {
        int displayRotation = getDisplayRotation();
        float[] remappedMatrix = new float[9];

        switch (displayRotation) {
            case Surface.ROTATION_90:
                SensorManager.remapCoordinateSystem(rotationMatrix, SensorManager.AXIS_Y, SensorManager.AXIS_MINUS_X, remappedMatrix);
                break;
            case Surface.ROTATION_180:
                SensorManager.remapCoordinateSystem(rotationMatrix, SensorManager.AXIS_MINUS_X, SensorManager.AXIS_MINUS_Y, remappedMatrix);
                break;
            case Surface.ROTATION_270:
                SensorManager.remapCoordinateSystem(rotationMatrix, SensorManager.AXIS_MINUS_Y, SensorManager.AXIS_X, remappedMatrix);
                break;
            case Surface.ROTATION_0:
            default:
                SensorManager.remapCoordinateSystem(rotationMatrix, SensorManager.AXIS_X, SensorManager.AXIS_Y, remappedMatrix);
                break;
        }

        return remappedMatrix;
    }

    @SuppressWarnings("deprecation")
    private int getDisplayRotation() {
        Context context = getContext();
        if (context == null) return Surface.ROTATION_0;

        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        if (windowManager == null) return Surface.ROTATION_0;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Display display = context.getDisplay();
            return display != null ? display.getRotation() : Surface.ROTATION_0;
        } else {
            return windowManager.getDefaultDisplay().getRotation();
        }
    }

    private void dispatchUpdate(float magneticAzimuth, float pitch, float roll) {
        float finalAzimuth = magneticAzimuth;
        if (useTrueNorth) {
            finalAzimuth = (magneticAzimuth + declination + 360f) % 360f;
        }

        // Smooth out tiny micro-jitter (< 0.05 degree) normalized across 360/0 wrap boundary
        float diffAngle = finalAzimuth - lastAzimuth;
        while (diffAngle < -180f) diffAngle += 360f;
        while (diffAngle > 180f) diffAngle -= 360f;
        if (Math.abs(diffAngle) < 0.05f) {
            return;
        }
        lastAzimuth = finalAzimuth;

        JSObject data = new JSObject();
        data.put("magneticHeading", Math.round(magneticAzimuth * 10.0) / 10.0);
        data.put("trueHeading", Math.round(finalAzimuth * 10.0) / 10.0);
        data.put("heading", Math.round(finalAzimuth * 10.0) / 10.0);
        data.put("declination", Math.round(declination * 10.0) / 10.0);
        data.put("useTrueNorth", useTrueNorth);
        data.put("accuracy", sensorAccuracyStatus);
        data.put("pitch", Math.round(pitch));
        data.put("roll", Math.round(roll));
        data.put("cardinal", getCardinalDirection(finalAzimuth));
        data.put("isFlat", Math.abs(pitch) < 30 && Math.abs(roll) < 30);

        notifyListeners("compassUpdate", data);
    }

    private String getCardinalDirection(float degrees) {
        if (degrees >= 22.5f && degrees < 67.5f) return "NE";
        if (degrees >= 67.5f && degrees < 112.5f) return "E";
        if (degrees >= 112.5f && degrees < 157.5f) return "SE";
        if (degrees >= 157.5f && degrees < 202.5f) return "S";
        if (degrees >= 202.5f && degrees < 247.5f) return "SW";
        if (degrees >= 247.5f && degrees < 292.5f) return "W";
        if (degrees >= 292.5f && degrees < 337.5f) return "NW";
        return "N";
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            switch (accuracy) {
                case SensorManager.SENSOR_STATUS_UNRELIABLE:
                    sensorAccuracyStatus = "unreliable";
                    break;
                case SensorManager.SENSOR_STATUS_ACCURACY_LOW:
                    sensorAccuracyStatus = "low";
                    break;
                case SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM:
                    sensorAccuracyStatus = "medium";
                    break;
                case SensorManager.SENSOR_STATUS_ACCURACY_HIGH:
                    sensorAccuracyStatus = "high";
                    break;
                default:
                    sensorAccuracyStatus = "unreliable";
                    break;
            }
        }
    }

    @Override
    protected void handleOnPause() {
        unregisterListeners();
        super.handleOnPause();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (isListening) {
            registerListeners();
        }
    }

    @Override
    protected void handleOnDestroy() {
        unregisterListeners();
        super.handleOnDestroy();
    }
}
