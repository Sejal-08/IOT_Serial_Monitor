const sensorInfoData = {
  "SHT40": {
    desc: "SHT40 is a high-accuracy digital temperature and humidity sensor. It communicates using I2C and is widely used in real-world applications such as environment monitoring, agriculture, and smart devices.",
    features: [
      { icon: "fas fa-bullseye", text: "High Accuracy" },
      { icon: "fas fa-leaf", text: "Low Power" },
      { icon: "fas fa-microchip", text: "Digital Output (I2C)" }
    ],
    learn: "<p><b>What is Humidity?</b><br>It is the amount of invisible water vapor floating in the air!</p><p><b>How does the sensor work?</b><br>Inside the sensor is a tiny capacitor made of two metal plates with a special sponge-like polymer between them. As the polymer absorbs microscopic water droplets from the air, it changes the electrical capacity between the plates! The computer measures this tiny electrical change to calculate exactly how wet the air is.</p>",
    learnSummary: "Learn how this sensor works, what humidity means and how it measures the air.",
    experiment: "Try breathing warm air on the sensor or bringing a cold glass of water nearby to see the values change!",
    challenge: "Can you make the humidity rise by 10% just using your breath?"
  },
  "VCNL4040": {
    desc: "VCNL4040 is a digital ambient light and proximity sensor. It measures the intensity of visible light to mimic the human eye's response, widely used to adjust screen brightness in smart devices.",
    features: [
      { icon: "fas fa-sun", text: "Ambient Light Sensing" },
      { icon: "fas fa-ruler", text: "Proximity Detection" },
      { icon: "fas fa-microchip", text: "Digital Output (I2C)" }
    ],
    learn: "<p><b>What is Lux?</b><br>Lux is the measurement of brightness! Your smartphone uses this to dim its screen in the dark.</p><p><b>How does the sensor work?</b><br>Inside is a tiny piece of silicon called a <i>photodiode</i>. When tiny particles of light (called photons) crash into the silicon, they knock electrons loose! This creates a tiny zap of electricity. The brighter the light, the more electrons get knocked loose, and the higher the number the sensor reads!</p>",
    learnSummary: "Learn how this sensor works, what lux means and how it senses light.",
    experiment: "Try covering the sensor with your hands to create a shadow, or shine a phone flashlight at it!",
    challenge: "Can you create a perfectly dark environment so the sensor reads exactly 0 lux?"
  },
  "BME680": {
    desc: "BME680 is a powerful 4-in-1 environmental sensor that measures Temperature, Humidity, Barometric Pressure, and Volatile Organic Compounds (VOCs) to determine indoor air quality.",
    features: [
      { icon: "fas fa-wind", text: "Air Quality (VOCs)" },
      { icon: "fas fa-cloud", text: "Barometric Pressure" },
      { icon: "fas fa-thermometer-half", text: "Temp & Humidity" }
    ],
    learn: "<p><b>What is Air Quality?</b><br>The air around us is full of invisible gases and tiny dust particles.</p><p><b>How does the sensor work?</b><br>The sensor has a tiny micro-hotplate that heats up to 300°C! When gases (like breath or perfume) touch this super-heated surface, they react chemically and change the electrical resistance of the metal. The computer measures this change to know if the air is clean or polluted!</p>",
    learnSummary: "Learn how this sensor works, what atmospheric pressure means and how it senses air quality.",
    experiment: "Try opening a window to let fresh air in, or safely spraying some perfume nearby to see the air quality change.",
    challenge: "Can you detect a change in the air pressure by moving the sensor from the floor to the ceiling?"
  },
  "AHT20": {
    desc: "AHT20 is a precision temperature and humidity sensor. It uses a capacitive humidity sensor and a standard on-chip temperature sensor for fast and reliable readings.",
    features: [
      { icon: "fas fa-tint", text: "Capacitive Humidity" },
      { icon: "fas fa-bolt", text: "Fast Response" },
      { icon: "fas fa-microchip", text: "Digital Output (I2C)" }
    ],
    learn: "<p><b>What is Humidity?</b><br>It is the amount of invisible water vapor floating in the air!</p><p><b>How does the sensor work?</b><br>Inside the sensor is a tiny capacitor made of two metal plates with a special sponge-like polymer between them. As the polymer absorbs microscopic water droplets from the air, it changes the electrical capacity between the plates! The computer measures this tiny electrical change to calculate exactly how wet the air is.</p>",
    learnSummary: "Learn how this sensor works, what humidity means and how it measures the air.",
    experiment: "Try breathing warm air on the sensor or bringing a cold glass of water nearby to see the values change!",
    challenge: "Can you make the humidity rise by 10% just using your breath?"
  },
  "STS30": {
    desc: "STS30 is a high-accuracy digital temperature sensor. It is extremely fast at registering changes in heat, making it perfect for rapid thermal monitoring.",
    features: [
      { icon: "fas fa-temperature-high", text: "High Precision" },
      { icon: "fas fa-stopwatch", text: "Rapid Response Time" },
      { icon: "fas fa-microchip", text: "Digital Output (I2C)" }
    ],
    learn: "<p><b>How do computers feel heat?</b><br>They use electricity!</p><p><b>How does the sensor work?</b><br>Inside the microchip is a special material called a <i>Thermistor</i>. When it gets hot, the atoms inside the material vibrate wildly, making it harder for electricity to pass through (this is called resistance). The computer measures exactly how much the electricity struggles to get through to calculate the exact temperature!</p>",
    learnSummary: "Learn how this sensor works, what humidity means and how it measures the air.",
    experiment: "Try breathing warm air on the sensor or bringing a cold glass of water nearby to see the values change!",
    challenge: "Can you make the humidity rise by 10% just using your breath?"
  },
  "STTS751": {
    desc: "STTS751 is a digital temperature sensor that measures ambient temperature accurately. It is commonly used in hardware to prevent overheating and thermal damage.",
    features: [
      { icon: "fas fa-thermometer-empty", text: "Thermal Monitoring" },
      { icon: "fas fa-shield-alt", text: "Overheat Protection" },
      { icon: "fas fa-leaf", text: "Low Voltage Operation" }
    ],
    learn: "<p><b>How do computers feel heat?</b><br>They use electricity!</p><p><b>How does the sensor work?</b><br>Inside the microchip is a special material called a <i>Thermistor</i>. When it gets hot, the atoms inside the material vibrate wildly, making it harder for electricity to pass through (this is called resistance). The computer measures exactly how much the electricity struggles to get through to calculate the exact temperature!</p>",
    learnSummary: "Learn how this sensor works, what humidity means and how it measures the air.",
    experiment: "Try breathing warm air on the sensor or bringing a cold glass of water nearby to see the values change!",
    challenge: "Can you make the humidity rise by 10% just using your breath?"
  },
  "VEML7700": {
    desc: "VEML7700 is a high-accuracy ambient light sensor with 16-bit resolution, capable of measuring up to 120,000 lux. It is used in professional weather stations.",
    features: [
      { icon: "fas fa-adjust", text: "120,000 Lux Range" },
      { icon: "fas fa-eye", text: "Human Eye Response" },
      { icon: "fas fa-microchip", text: "16-bit Resolution" }
    ],
    learn: "<p><b>What is Lux?</b><br>Lux is the measurement of brightness! Your smartphone uses this to dim its screen in the dark.</p><p><b>How does the sensor work?</b><br>Inside is a tiny piece of silicon called a <i>photodiode</i>. When tiny particles of light (called photons) crash into the silicon, they knock electrons loose! This creates a tiny zap of electricity. The brighter the light, the more electrons get knocked loose, and the higher the number the sensor reads!</p>",
    learnSummary: "Learn how this sensor works, what lux means and how it senses light.",
    experiment: "Try covering the sensor with your hands to create a shadow, or shine a phone flashlight at it!",
    challenge: "Can you create a perfectly dark environment so the sensor reads exactly 0 lux?"
  },
  "VL53L0X": {
    desc: "VL53L0X is a Time-of-Flight (ToF) laser-ranging module. It fires a harmless invisible laser and measures exactly how long it takes to bounce back to calculate distance.",
    features: [
      { icon: "fas fa-space-shuttle", text: "Time-of-Flight (ToF)" },
      { icon: "fas fa-ruler-combined", text: "Millimeter Precision" },
      { icon: "fas fa-eye-slash", text: "Invisible Laser" }
    ],
    learn: "<p><b>How do we measure invisible distance?</b><br>We can use the speed of light!</p><p><b>How does the sensor work?</b><br>It works just like a bat using echolocation, but with lasers! The sensor shoots out an invisible laser beam, and waits for it to bounce off an object and return. Because the sensor knows exactly how fast light travels, it counts the microscopic nanoseconds it took for the echo to return and calculates the exact distance!</p>",
    learnSummary: "Learn how this sensor works, what TOF means and how it measures distance.",
    experiment: "Try moving your hand slowly closer and further away to see the distance measurements update in real-time.",
    challenge: "Can you position an object exactly 15 centimeters away from the sensor?"
  },
  "HC-SR04": {
    desc: "HC-SR04 is an ultrasonic distance sensor. It sends out a high-frequency sound wave and listens for the echo, similar to how bats use echolocation.",
    features: [
      { icon: "fas fa-wave-square", text: "Ultrasonic Waves" },
      { icon: "fas fa-volume-up", text: "Echolocation" },
      { icon: "fas fa-ruler", text: "2cm to 400cm Range" }
    ],
    learn: "<p><b>How do we measure invisible distance?</b><br>We can use the speed of sound!</p><p><b>How does the sensor work?</b><br>It works exactly like a bat using echolocation! The sensor has a 'mouth' that screams an ultrasonic sound wave (too high-pitched for humans to hear), and an 'ear' that listens for the echo to bounce off a wall. By counting the milliseconds it takes for the echo to return, it calculates the exact distance!</p>",
    learnSummary: "Learn how this sensor works, what TOF means and how it measures distance.",
    experiment: "Try moving your hand slowly closer and further away to see the distance measurements update in real-time.",
    challenge: "Can you position an object exactly 15 centimeters away from the sensor?"
  },
  "LIS3DH": {
    desc: "LIS3DH is a 3-axis accelerometer that measures movement, tilt, and gravity in 3D space. It is exactly like the sensor inside smartphones that detects screen rotation.",
    features: [
      { icon: "fas fa-arrows-alt", text: "3-Axis Measurement" },
      { icon: "fas fa-mobile-alt", text: "Tilt & Rotation" },
      { icon: "fas fa-leaf", text: "Ultra Low-Power" }
    ],
    learn: "<p><b>What is an Accelerometer?</b><br>It is a sensor that measures gravity and movement in 3D space (Up/Down, Left/Right, Forward/Backward).</p><p><b>How does the sensor work?</b><br>Inside the microchip is a microscopic weight attached to tiny silicon springs! When you tilt or shake the sensor, gravity pulls on the microscopic weight, bending the tiny springs. The chip measures how far the springs bend and turns that into a number for the computer!</p>",
    learnSummary: "Learn how this sensor works, what acceleration means and how it detects motion.",
    experiment: "Try picking up the sensor and tilting it in different directions to watch the gravity forces shift.",
    challenge: "Can you hold the sensor perfectly flat so the X and Y axes read exactly 0?"
  },
  "LIS2DH": {
    desc: "LIS2DH is an ultra-low-power, high-performance 3-axis linear accelerometer. It can detect free-fall, motion, and taps.",
    features: [
      { icon: "fas fa-hand-pointer", text: "Tap Detection" },
      { icon: "fas fa-parachute-box", text: "Free-Fall Detection" },
      { icon: "fas fa-battery-full", text: "High Performance" }
    ],
    learn: "<p><b>What is an Accelerometer?</b><br>It is a sensor that measures gravity and movement in 3D space (Up/Down, Left/Right, Forward/Backward).</p><p><b>How does the sensor work?</b><br>Inside the microchip is a microscopic weight attached to tiny silicon springs! When you tilt or shake the sensor, gravity pulls on the microscopic weight, bending the tiny springs. The chip measures how far the springs bend and turns that into a number for the computer!</p>",
    learnSummary: "Learn how this sensor works, what acceleration means and how it detects motion.",
    experiment: "Try picking up the sensor and tilting it in different directions to watch the gravity forces shift.",
    challenge: "Can you hold the sensor perfectly flat so the X and Y axes read exactly 0?"
  },
  "TLV493D": {
    desc: "TLV493D is a 3D magnetic sensor that measures magnetic fields in X, Y, and Z dimensions. It can act as a highly precise digital compass.",
    features: [
      { icon: "fas fa-magnet", text: "3D Magnetic Sensing" },
      { icon: "fas fa-compass", text: "Direction Tracking" },
      { icon: "fas fa-cube", text: "XYZ Coordinates" }
    ],
    learn: "<p><b>What are Magnetic Fields?</b><br>Magnets create an invisible force field that can pull on certain metals.</p><p><b>How does the sensor work?</b><br>It uses the <i>Hall Effect</i>! When electricity flows through a tiny strip of metal inside the sensor, bringing a magnet close will actually push and bend the flowing electrons to one side of the metal strip! The sensor measures this microscopic traffic jam of electrons to know exactly how strong the magnet is.</p>",
    learnSummary: "Learn how this sensor works, what magnetic fields are and how it detects them.",
    experiment: "Try bringing a small fridge magnet near the sensor and watch how the magnetic field strength jumps!",
    challenge: "Can you figure out which side of your magnet is the North pole just by looking at the numbers?"
  },
  "LTR390": {
    desc: "LTR390 is an ultraviolet (UV) light and ambient light sensor. It helps measure the intensity of the sun's harmful rays to calculate the UV Index.",
    features: [
      { icon: "fas fa-sun", text: "UV Index Calculation" },
      { icon: "fas fa-lightbulb", text: "Ambient Light Sensing" },
      { icon: "fas fa-umbrella-beach", text: "Sun Exposure Tracking" }
    ],
    learn: "<p><b>What is UV Light?</b><br>Ultraviolet light is invisible energy from the sun that causes sunburns!</p><p><b>How does the sensor work?</b><br>Inside is a tiny piece of silicon called a <i>photodiode</i> covered in a special chemical filter. The filter acts like sunglasses, blocking all normal light but letting invisible UV photons pass through. When the UV photons hit the silicon, they create electricity, telling the computer how dangerous the sun is right now!</p>",
    learnSummary: "Learn how this sensor works, what lux means and how it senses light.",
    experiment: "Try covering the sensor with your hands to create a shadow, or shine a phone flashlight at it!",
    challenge: "Can you create a perfectly dark environment so the sensor reads exactly 0 lux?"
  },
  "Weather Shield": {
    desc: "The Weather Shield combines multiple sensors onto one board to measure Temperature, Humidity, Pressure, and Light simultaneously like a mini weather station.",
    features: [
      { icon: "fas fa-cloud-sun", text: "Multi-Sensor Board" },
      { icon: "fas fa-tachometer-alt", text: "Atmospheric Pressure" },
      { icon: "fas fa-thermometer", text: "Climate Tracking" }
    ],
    learn: "<p><b>What is Atmospheric Pressure?</b><br>It is the heavy weight of all the Earth's air pushing down on you!</p><p><b>How does the sensor work?</b><br>Inside the chip is a microscopic balloon made of silicon. When the weather changes and the air gets heavier, it physically squishes the tiny silicon balloon! The microchip measures exactly how much the balloon is being squished to predict if a rainstorm is coming.</p>",
    learnSummary: "Learn how this sensor works, what atmospheric pressure means and how it predicts the weather.",
    experiment: "Try taking the sensor outside, or place it near a bright sunny window, to see how the temperature and light change!",
    challenge: "Can you detect a change in the air pressure by moving the sensor from the floor to the ceiling?"
  },
  "SEN66": {
    desc: "SEN66 is a comprehensive Air Quality module that measures particulate matter (PM1.0, PM2.5, PM10), VOCs, CO2, temperature, and humidity for advanced environmental monitoring.",
    features: [
      { icon: "fas fa-smog", text: "Particulate Matter (PM2.5)" },
      { icon: "fas fa-lungs", text: "CO2 & VOC Detection" },
      { icon: "fas fa-laptop-medical", text: "Health Monitoring" }
    ],
    learn: "<p><b>What is Air Quality?</b><br>The air around us is full of invisible gases and tiny dust particles.</p><p><b>How does the sensor work?</b><br>To detect invisible dust (PM2.5), this sensor acts like a microscopic radar! It shines a tiny, invisible laser beam into the air. When a floating dust particle passes through, it reflects the laser beam back at a detector. The sensor counts these tiny laser flashes to know exactly how much dust you are breathing!</p>",
    learnSummary: "Learn how this sensor works, what atmospheric pressure means and how it senses air quality.",
    experiment: "Try opening a window to let fresh air in, or safely spraying some perfume nearby to see the air quality change.",
    challenge: "Can you detect a change in the air pressure by moving the sensor from the floor to the ceiling?"
  },
  "Rain Gauge": {
    desc: "The Rain Gauge is a mechanical tipping-bucket sensor. Every time it fills with a tiny amount of water, it tips and sends an electrical pulse to measure precipitation.",
    features: [
      { icon: "fas fa-cloud-rain", text: "Tipping Bucket" },
      { icon: "fas fa-tint", text: "Precipitation Tracking" },
      { icon: "fas fa-bolt", text: "Pulse Output" }
    ],
    learn: "<p><b>How do we measure rainfall?</b><br>By catching the rain as it falls from the sky!</p><p><b>How does the sensor work?</b><br>Inside the rain gauge is a tiny mechanical seesaw called a <i>tipping bucket</i>. When enough raindrops fall into the top, the weight of the water causes the bucket to tip over and spill! Every time it tips, it pushes a tiny magnetic switch that sends a 'zap' of electricity to the computer. The computer counts the zaps to know how much it rained!</p>",
    learnSummary: "Learn how this sensor works, what a tipping bucket is and how it measures rainfall.",
    experiment: "Try dripping water into the gauge using a dropper or a small cup to simulate a rainstorm!",
    challenge: "Can you pour exactly enough water to simulate 5mm of rainfall without overflowing?"
  },
  "Wind Sensor": {
    desc: "The Wind Sensor combo I2Cludes an anemometer (spinning cups for speed) and a wind vane (for direction). It is essential for tracking weather patterns.",
    features: [
      { icon: "fas fa-fan", text: "Anemometer (Speed)" },
      { icon: "fas fa-location-arrow", text: "Wind Vane (Direction)" },
      { icon: "fas fa-flag", text: "Meteorology" }
    ],
    learn: "<p><b>How do we measure wind speed?</b><br>By seeing how fast the air pushes things!</p><p><b>How does the sensor work?</b><br>The sensor is an <i>Anemometer</i> that uses small cups to catch the wind. As the wind blows, it pushes the cups and spins a central magnet. Every time the magnet completes one full circle, it triggers a tiny electronic switch. The faster the wind blows, the faster the switch clicks, and the computer calculates the wind speed!</p>",
    learnSummary: "Learn how this sensor works, what atmospheric pressure means and how it senses air quality.",
    experiment: "Try blowing air across the sensor or using a small desk fan to create a mini-hurricane!",
    challenge: "Can you blow hard enough on the wind sensor to simulate a Category 1 storm?"
  },
  "Soil Sensor": {
    desc: "The Soil Sensor measures NPK (Nitrogen, Phosphorus, Potassium), moisture, temperature, EC, and pH. It acts as a complete miniature agricultural laboratory.",
    features: [
      { icon: "fas fa-seedling", text: "NPK Nutrients" },
      { icon: "fas fa-water", text: "Moisture & pH" },
      { icon: "fas fa-tractor", text: "Smart Agriculture" }
    ],
    learn: "<p><b>Why do plants need a sensor?</b><br>Plants need a perfect balance of water and food (Nitrogen, Phosphorus, and Potassium) to grow!</p><p><b>How does the sensor work?</b><br>The metal prongs shoot a small electrical current into the dirt. Water is a great conductor of electricity, so if the dirt is wet, the electricity flows easily! If the dirt is dry, the electricity struggles to move. The sensor measures this electrical resistance to tell the farmer exactly when the plant is thirsty.</p>",
    learnSummary: "Learn how this sensor works, what NPK means and how it measures soil health.",
    experiment: "Try touching the soil sensor prongs with your damp fingers to simulate wet soil!",
    challenge: "Can you find a dry spot in a potted plant and compare it to a freshly watered spot?"
  },
  "Relay": {
    desc: "A Relay is an electrically operated swI2Ch. It allows a tiny low-power signal from your Arduino to safely turn on high-power devices like lamps or motors.",
    features: [
      { icon: "fas fa-toggle-on", text: "Mechanical SwI2Ch" },
      { icon: "fas fa-plug", text: "High Power Control" },
      { icon: "fas fa-shield-alt", text: "Electrical Isolation" }
    ],
    learn: "<p><b>What is an Output?</b><br>Sensors are 'Inputs' that read the world, but 'Outputs' let the computer physically change the world!</p><p><b>How does the relay work?</b><br>A microchip only uses 3.3 volts of electricity, which isn't enough to power a real desk lamp. A Relay is an electronic bridge! The microchip sends 3.3V to power a tiny electromagnet inside the Relay, which pulls a physical metal switch closed, allowing 120 volts of wall-power to turn on the lamp safely!</p>",
    learnSummary: "Learn how this component works, what GPIO means and how it interacts with the physical world.",
    experiment: "Try triggering the input and watch how the digital signal instantly flips between 0 and 1 (ON and OFF).",
    challenge: "Can you tap the sensor exactly 5 times in a row to create a secret morse code signal?"
  },
  "Blinky": {
    desc: "Blinky represents an LED (Light Emitting Diode). It converts electrical current directly into light and is the 'Hello World' of hardware programming.",
    features: [
      { icon: "fas fa-lightbulb", text: "Light Emitting Diode" },
      { icon: "fas fa-battery-half", text: "Low Power Consumption" },
      { icon: "fas fa-code", text: "Hardware Basics" }
    ],
    learn: "<p><b>What is an Output?</b><br>Sensors are 'Inputs' that read the world, but 'Outputs' let the computer physically change the world!</p><p><b>How does the LED work?</b><br>LED stands for <i>Light Emitting Diode</i>. Unlike old lightbulbs that burn hot wires, an LED is a tiny semiconductor crystal. When the computer sends electricity into the crystal, the electrons jump across a microscopic gap and release their extra energy as pure particles of light!</p>",
    learnSummary: "Learn how this component works, what GPIO means and how it interacts with the physical world.",
    experiment: "Try triggering the input and watch how the digital signal instantly flips between 0 and 1 (ON and OFF).",
    challenge: "Can you tap the sensor exactly 5 times in a row to create a secret morse code signal?"
  },
  "Buzzer": {
    desc: "A Buzzer converts electrical signals into sound vibrations using piezoelectric crystals. It can beep, alarm, or play musical notes based on the frequency.",
    features: [
      { icon: "fas fa-music", text: "Piezoelectric Sound" },
      { icon: "fas fa-bell", text: "Alarms & Alerts" },
      { icon: "fas fa-wave-square", text: "Frequency Control" }
    ],
    learn: "<p><b>What is an Output?</b><br>Sensors are 'Inputs' that read the world, but 'Outputs' let the computer physically change the world!</p><p><b>How does the buzzer work?</b><br>Inside the buzzer is a tiny disc made of a <i>Piezoelectric</i> crystal. When the computer zaps the crystal with electricity, it physically bends! By zapping it thousands of times per second, the crystal vibrates incredibly fast, pushing the air around it to create sound waves that you can hear!</p>",
    learnSummary: "Learn how this component works, what GPIO means and how it interacts with the physical world.",
    experiment: "Try triggering the input and watch how the digital signal instantly flips between 0 and 1 (ON and OFF).",
    challenge: "Can you tap the sensor exactly 5 times in a row to create a secret morse code signal?"
  },
  "TTP223": {
    desc: "TTP223 is a capacitive touch sensor. It detects the touch of your finger through plastic or glass without any physical buttons or moving parts.",
    features: [
      { icon: "fas fa-fingerprint", text: "Capacitive Touch" },
      { icon: "fas fa-magic", text: "No Moving Parts" },
      { icon: "fas fa-mobile", text: "Smartphone Tech" }
    ],
    learn: "<p><b>How do touch sensors work without moving parts?</b><br>Your body is actually full of electricity!</p><p><b>How does the sensor work?</b><br>The touch sensor creates an invisible electrical field. Because the human body is mostly water and can hold an electrical charge, when your finger gets close, you actually steal a tiny bit of the sensor's electricity! The sensor feels this drop in energy and knows you touched it, even without a physical button.</p>",
    learnSummary: "Learn how this component works, what GPIO means and how it interacts with the physical world.",
    experiment: "Try triggering the input and watch how the digital signal instantly flips between 0 and 1 (ON and OFF).",
    challenge: "Can you tap the sensor exactly 5 times in a row to create a secret morse code signal?"
  },
  "Reed Switch": {
    desc: "A Reed Switch contains two tiny metal contacts in a glass tube that snap together when a magnetic field is nearby, completing the cI2Cuit.",
    features: [
      { icon: "fas fa-magnet", text: "Magnetic Activation" },
      { icon: "fas fa-door-open", text: "Door/Window Alarms" },
      { icon: "fas fa-bolt", text: "Mechanical Snap" }
    ],
    learn: "<p><b>What are Magnetic Fields?</b><br>Magnets create an invisible force field that can pull on certain metals.</p><p><b>How does the sensor work?</b><br>Inside the glass tube are two tiny metal wires that are almost touching. When you bring a magnet close, the invisible magnetic force pulls the two metal wires together until they touch! This completes the circuit and lets electricity flow through, telling the computer that a magnet is nearby.</p>",
    learnSummary: "Learn how this sensor works, what magnetic fields are and how it detects them.",
    experiment: "Try bringing a small fridge magnet near the sensor and watch how the magnetic field strength jumps!",
    challenge: "Can you figure out which side of your magnet is the North pole just by looking at the numbers?"
  },
  "Hall Sensor": {
    desc: "A Hall Effect sensor measures the magnitude of a magnetic field. Its output voltage changes directly with the magnetic field strength, often used in motors.",
    features: [
      { icon: "fas fa-magnet", text: "Magnetic Field Strength" },
      { icon: "fas fa-car", text: "Motor RPM Tracking" },
      { icon: "fas fa-wave-square", text: "Analog Output" }
    ],
    learn: "<p><b>What are Magnetic Fields?</b><br>Magnets create an invisible force field that can pull on certain metals.</p><p><b>How does the sensor work?</b><br>It uses the <i>Hall Effect</i>! When electricity flows through a tiny strip of metal inside the sensor, bringing a magnet close will actually push and bend the flowing electrons to one side of the metal strip! The sensor measures this microscopic traffic jam of electrons to know exactly how strong the magnet is.</p>",
    learnSummary: "Learn how this sensor works, what magnetic fields are and how it detects them.",
    experiment: "Try bringing a small fridge magnet near the sensor and watch how the magnetic field strength jumps!",
    challenge: "Can you figure out which side of your magnet is the North pole just by looking at the numbers?"
  },
  "IR Sensor": {
    desc: "An Infrared (IR) sensor emits invisible IR light and measures how much bounces back to detect objects, commonly used in line-following robots.",
    features: [
      { icon: "fas fa-eye-slash", text: "Invisible Infrared" },
      { icon: "fas fa-robot", text: "Object Detection" },
      { icon: "fas fa-broadcast-tower", text: "Reflection Based" }
    ],
    learn: "<p><b>How does it detect lines without eyes?</b><br>By looking at invisible reflections!</p><p><b>How does the sensor work?</b><br>The sensor has two bulbs. One bulb acts like a flashlight, shining invisible Infrared (IR) light at the ground. The other bulb acts like an eye, watching for the light to bounce back. White paper reflects the light back perfectly, but a black line absorbs the light! The sensor tells the robot if it sees light (white) or darkness (black).</p>",
    learnSummary: "Learn how this component works, what GPIO means and how it interacts with the physical world.",
    experiment: "Try triggering the input and watch how the digital signal instantly flips between 0 and 1 (ON and OFF).",
    challenge: "Can you tap the sensor exactly 5 times in a row to create a secret morse code signal?"
  }
};
