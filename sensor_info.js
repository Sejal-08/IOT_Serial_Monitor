const sensorInfoData = {
  "SHT40": {
    desc: "SHT40 is a high-accuracy digital temperature and humidity sensor. It communicates using I²C and is widely used in real-world applications such as environment monitoring, agriculture, and smart devices.",
    features: [
      { icon: "fas fa-bullseye", text: "High Accuracy" },
      { icon: "fas fa-leaf", text: "Low Power" },
      { icon: "fas fa-microchip", text: "Digital Output (I²C)" }
    ]
  },
  "VCNL4040": {
    desc: "VCNL4040 is a digital ambient light and proximity sensor. It measures the intensity of visible light to mimic the human eye's response, widely used to adjust screen brightness in smart devices.",
    features: [
      { icon: "fas fa-sun", text: "Ambient Light Sensing" },
      { icon: "fas fa-ruler", text: "Proximity Detection" },
      { icon: "fas fa-microchip", text: "Digital Output (I²C)" }
    ]
  },
  "BME680": {
    desc: "BME680 is a powerful 4-in-1 environmental sensor that measures Temperature, Humidity, Barometric Pressure, and Volatile Organic Compounds (VOCs) to determine indoor air quality.",
    features: [
      { icon: "fas fa-wind", text: "Air Quality (VOCs)" },
      { icon: "fas fa-cloud", text: "Barometric Pressure" },
      { icon: "fas fa-thermometer-half", text: "Temp & Humidity" }
    ]
  },
  "AHT20": {
    desc: "AHT20 is a precision temperature and humidity sensor. It uses a capacitive humidity sensor and a standard on-chip temperature sensor for fast and reliable readings.",
    features: [
      { icon: "fas fa-tint", text: "Capacitive Humidity" },
      { icon: "fas fa-bolt", text: "Fast Response" },
      { icon: "fas fa-microchip", text: "Digital Output (I²C)" }
    ]
  },
  "STS30": {
    desc: "STS30 is a high-accuracy digital temperature sensor. It is extremely fast at registering changes in heat, making it perfect for rapid thermal monitoring.",
    features: [
      { icon: "fas fa-temperature-high", text: "High Precision" },
      { icon: "fas fa-stopwatch", text: "Rapid Response Time" },
      { icon: "fas fa-microchip", text: "Digital Output (I²C)" }
    ]
  },
  "STTS751": {
    desc: "STTS751 is a digital temperature sensor that measures ambient temperature accurately. It is commonly used in hardware to prevent overheating and thermal damage.",
    features: [
      { icon: "fas fa-thermometer-empty", text: "Thermal Monitoring" },
      { icon: "fas fa-shield-alt", text: "Overheat Protection" },
      { icon: "fas fa-leaf", text: "Low Voltage Operation" }
    ]
  },
  "VEML7700": {
    desc: "VEML7700 is a high-accuracy ambient light sensor with 16-bit resolution, capable of measuring up to 120,000 lux. It is used in professional weather stations.",
    features: [
      { icon: "fas fa-adjust", text: "120,000 Lux Range" },
      { icon: "fas fa-eye", text: "Human Eye Response" },
      { icon: "fas fa-microchip", text: "16-bit Resolution" }
    ]
  },
  "VL53L0X": {
    desc: "VL53L0X is a Time-of-Flight (ToF) laser-ranging module. It fires a harmless invisible laser and measures exactly how long it takes to bounce back to calculate distance.",
    features: [
      { icon: "fas fa-space-shuttle", text: "Time-of-Flight (ToF)" },
      { icon: "fas fa-ruler-combined", text: "Millimeter Precision" },
      { icon: "fas fa-eye-slash", text: "Invisible Laser" }
    ]
  },
  "HC-SR04": {
    desc: "HC-SR04 is an ultrasonic distance sensor. It sends out a high-frequency sound wave and listens for the echo, similar to how bats use echolocation.",
    features: [
      { icon: "fas fa-wave-square", text: "Ultrasonic Waves" },
      { icon: "fas fa-volume-up", text: "Echolocation" },
      { icon: "fas fa-ruler", text: "2cm to 400cm Range" }
    ]
  },
  "LIS3DH": {
    desc: "LIS3DH is a 3-axis accelerometer that measures movement, tilt, and gravity in 3D space. It is exactly like the sensor inside smartphones that detects screen rotation.",
    features: [
      { icon: "fas fa-arrows-alt", text: "3-Axis Measurement" },
      { icon: "fas fa-mobile-alt", text: "Tilt & Rotation" },
      { icon: "fas fa-leaf", text: "Ultra Low-Power" }
    ]
  },
  "LIS2DH": {
    desc: "LIS2DH is an ultra-low-power, high-performance 3-axis linear accelerometer. It can detect free-fall, motion, and taps.",
    features: [
      { icon: "fas fa-hand-pointer", text: "Tap Detection" },
      { icon: "fas fa-parachute-box", text: "Free-Fall Detection" },
      { icon: "fas fa-battery-full", text: "High Performance" }
    ]
  },
  "TLV493D": {
    desc: "TLV493D is a 3D magnetic sensor that measures magnetic fields in X, Y, and Z dimensions. It can act as a highly precise digital compass.",
    features: [
      { icon: "fas fa-magnet", text: "3D Magnetic Sensing" },
      { icon: "fas fa-compass", text: "Direction Tracking" },
      { icon: "fas fa-cube", text: "XYZ Coordinates" }
    ]
  },
  "LTR390": {
    desc: "LTR390 is an ultraviolet (UV) light and ambient light sensor. It helps measure the intensity of the sun's harmful rays to calculate the UV Index.",
    features: [
      { icon: "fas fa-sun", text: "UV Index Calculation" },
      { icon: "fas fa-lightbulb", text: "Ambient Light Sensing" },
      { icon: "fas fa-umbrella-beach", text: "Sun Exposure Tracking" }
    ]
  },
  "Weather Shield": {
    desc: "The Weather Shield combines multiple sensors onto one board to measure Temperature, Humidity, Pressure, and Light simultaneously like a mini weather station.",
    features: [
      { icon: "fas fa-cloud-sun", text: "Multi-Sensor Board" },
      { icon: "fas fa-tachometer-alt", text: "Atmospheric Pressure" },
      { icon: "fas fa-thermometer", text: "Climate Tracking" }
    ]
  },
  "SEN66": {
    desc: "SEN66 is a comprehensive Air Quality module that measures particulate matter (PM1.0, PM2.5, PM10), VOCs, CO2, temperature, and humidity for advanced environmental monitoring.",
    features: [
      { icon: "fas fa-smog", text: "Particulate Matter (PM2.5)" },
      { icon: "fas fa-lungs", text: "CO2 & VOC Detection" },
      { icon: "fas fa-laptop-medical", text: "Health Monitoring" }
    ]
  },
  "Rain Gauge": {
    desc: "The Rain Gauge is a mechanical tipping-bucket sensor. Every time it fills with a tiny amount of water, it tips and sends an electrical pulse to measure precipitation.",
    features: [
      { icon: "fas fa-cloud-rain", text: "Tipping Bucket" },
      { icon: "fas fa-tint", text: "Precipitation Tracking" },
      { icon: "fas fa-bolt", text: "Pulse Output" }
    ]
  },
  "Wind Sensor": {
    desc: "The Wind Sensor combo includes an anemometer (spinning cups for speed) and a wind vane (for direction). It is essential for tracking weather patterns.",
    features: [
      { icon: "fas fa-fan", text: "Anemometer (Speed)" },
      { icon: "fas fa-location-arrow", text: "Wind Vane (Direction)" },
      { icon: "fas fa-flag", text: "Meteorology" }
    ]
  },
  "Soil Sensor": {
    desc: "The Soil Sensor measures NPK (Nitrogen, Phosphorus, Potassium), moisture, temperature, EC, and pH. It acts as a complete miniature agricultural laboratory.",
    features: [
      { icon: "fas fa-seedling", text: "NPK Nutrients" },
      { icon: "fas fa-water", text: "Moisture & pH" },
      { icon: "fas fa-tractor", text: "Smart Agriculture" }
    ]
  },
  "Relay": {
    desc: "A Relay is an electrically operated switch. It allows a tiny low-power signal from your Arduino to safely turn on high-power devices like lamps or motors.",
    features: [
      { icon: "fas fa-toggle-on", text: "Mechanical Switch" },
      { icon: "fas fa-plug", text: "High Power Control" },
      { icon: "fas fa-shield-alt", text: "Electrical Isolation" }
    ]
  },
  "Blinky": {
    desc: "Blinky represents an LED (Light Emitting Diode). It converts electrical current directly into light and is the 'Hello World' of hardware programming.",
    features: [
      { icon: "fas fa-lightbulb", text: "Light Emitting Diode" },
      { icon: "fas fa-battery-half", text: "Low Power Consumption" },
      { icon: "fas fa-code", text: "Hardware Basics" }
    ]
  },
  "Buzzer": {
    desc: "A Buzzer converts electrical signals into sound vibrations using piezoelectric crystals. It can beep, alarm, or play musical notes based on the frequency.",
    features: [
      { icon: "fas fa-music", text: "Piezoelectric Sound" },
      { icon: "fas fa-bell", text: "Alarms & Alerts" },
      { icon: "fas fa-wave-square", text: "Frequency Control" }
    ]
  },
  "TTP223": {
    desc: "TTP223 is a capacitive touch sensor. It detects the touch of your finger through plastic or glass without any physical buttons or moving parts.",
    features: [
      { icon: "fas fa-fingerprint", text: "Capacitive Touch" },
      { icon: "fas fa-magic", text: "No Moving Parts" },
      { icon: "fas fa-mobile", text: "Smartphone Tech" }
    ]
  },
  "Reed Switch": {
    desc: "A Reed Switch contains two tiny metal contacts in a glass tube that snap together when a magnetic field is nearby, completing the circuit.",
    features: [
      { icon: "fas fa-magnet", text: "Magnetic Activation" },
      { icon: "fas fa-door-open", text: "Door/Window Alarms" },
      { icon: "fas fa-bolt", text: "Mechanical Snap" }
    ]
  },
  "Hall Sensor": {
    desc: "A Hall Effect sensor measures the magnitude of a magnetic field. Its output voltage changes directly with the magnetic field strength, often used in motors.",
    features: [
      { icon: "fas fa-magnet", text: "Magnetic Field Strength" },
      { icon: "fas fa-car", text: "Motor RPM Tracking" },
      { icon: "fas fa-wave-square", text: "Analog Output" }
    ]
  },
  "IR Sensor": {
    desc: "An Infrared (IR) sensor emits invisible IR light and measures how much bounces back to detect objects, commonly used in line-following robots.",
    features: [
      { icon: "fas fa-eye-slash", text: "Invisible Infrared" },
      { icon: "fas fa-robot", text: "Object Detection" },
      { icon: "fas fa-broadcast-tower", text: "Reflection Based" }
    ]
  }
};
