const { createApp } = Vue

createApp({
    data() {
        return {
            isDropdownOpen: false,
            tabs: ['Length', 'Weight', 'Temperature', 'Area', 'Timestamp'],
            currentTab: 'Length',
            values: {
                Length: { value1: 0, value2: 0 },
                Weight: { value1: 0, value2: 0 },
                Temperature: { value1: 0, value2: 0 },
                Area: { value1: 0, value2: 0 },
                Timestamp: { value1: 0, value2: 0 }
            },
            dateTime: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                day: new Date().getDate(),
                hour: new Date().getHours(),
                minute: new Date().getMinutes(),
                second: new Date().getSeconds()
            },
            formattedDateTime: {
                month: '',
                day: '',
                hour: '',
                minute: '',
                second: ''
            },
            fromUnit: '',
            toUnit: '',
            units: {
                Length: ['in', 'cm', 'ft', 'km', 'm', 'mi', 'yd'],
                Weight: ['lb', 'kg', 'oz', 'g'],
                Temperature: ['F', 'C'],
                Area: ['m²', 'km²', 'ft²', 'yd²', 'acre', 'ha', 'mi²'],
                Timestamp: ['Unix', 'Local']
            },
            conversions: {
                Length: {
                    m: 1,
                    km: 1000,
                    cm: 0.01,
                    in: 0.0254,
                    ft: 0.3048,
                    mi: 1609.344,
                    yd: 0.9144
                },
                Weight: {
                    kg: 1,
                    g: 0.001,
                    lb: 0.45359237,
                    oz: 0.028349523125
                },
                Temperature: {
                    F: {
                        toC: value => (value - 32) * 5/9,
                        fromC: value => (value * 9/5) + 32
                    }
                },
                Area: {
                    'm²': 1,
                    'km²': 1000000,
                    'ft²': 0.092903,
                    'yd²': 0.836127,
                    'acre': 4046.86,
                    'ha': 10000,
                    'mi²': 2589988.11
                }
            },
            unitNames: {
                Length: {
                    in: 'Inches',
                    cm: 'Centimeters',
                    ft: 'Feet',
                    km: 'Kilometers',
                    m: 'Meters',
                    mi: 'Miles',
                    yd: 'Yards'
                },
                Weight: {
                    lb: 'Pounds',
                    kg: 'Kilograms',
                    oz: 'Ounces',
                    g: 'Grams'
                },
                Temperature: {
                    F: 'Fahrenheit',
                    C: 'Celsius'
                },
                Area: {
                    'm²': 'Square Meters',
                    'km²': 'Square Kilometers',
                    'ft²': 'Square Feet',
                    'yd²': 'Square Yards',
                    'acre': 'Acres',
                    'ha': 'Hectares',
                    'mi²': 'Square Miles'
                },
                Timestamp: {
                    Unix: 'Unix Timestamp',
                    Local: 'Local Date/Time'
                }
            }
        }
    },
    computed: {
        value1: {
            get() {
                return this.values[this.currentTab].value1;
            },
            set(value) {
                this.values[this.currentTab].value1 = value;
            }
        },
        value2: {
            get() {
                return this.values[this.currentTab].value2;
            },
            set(value) {
                this.values[this.currentTab].value2 = value;
            }
        },
        currentUnits() {
            return this.units[this.currentTab]
        },
        formattedMonth: {
            get() {
                return String(this.dateTime.month).padStart(2, '0');
            },
            set(value) {
                this.dateTime.month = parseInt(value) || 1;
            }
        },
        formattedDay: {
            get() {
                return String(this.dateTime.day).padStart(2, '0');
            },
            set(value) {
                this.dateTime.day = parseInt(value) || 1;
            }
        },
        formattedHour: {
            get() {
                return String(this.dateTime.hour).padStart(2, '0');
            },
            set(value) {
                this.dateTime.hour = parseInt(value) || 0;
            }
        },
        formattedMinute: {
            get() {
                return String(this.dateTime.minute).padStart(2, '0');
            },
            set(value) {
                this.dateTime.minute = parseInt(value) || 0;
            }
        },
        formattedSecond: {
            get() {
                return String(this.dateTime.second).padStart(2, '0');
            },
            set(value) {
                this.dateTime.second = parseInt(value) || 0;
            }
        },
        result() {
            if (!this.value1 || !this.fromUnit || !this.toUnit) return '0'
            
            if (this.currentTab === 'Temperature') {
                return this.convertTemperature()
            }
            
            const conversionRates = this.conversions[this.currentTab]
            const baseValue = this.value1 * conversionRates[this.fromUnit]
            const result = baseValue / conversionRates[this.toUnit]
            
            return `${this.value1} ${this.fromUnit} = ${result.toFixed(4)} ${this.toUnit}`
        },
        conversionDetails() {
            if (!this.value1 && this.currentTab !== 'Timestamp') return '';
            
            if (this.currentTab === 'Temperature') {
                return `${this.value1} ${this.unitNames.Temperature.F} = ${this.value2} ${this.unitNames.Temperature.C}`;
            }
            
            if (this.currentTab === 'Timestamp') {
                const { year, month, day, hour, minute, second } = this.dateTime;
                const date = new Date(year, month - 1, day, hour, minute, second);
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${timezone} = ${this.value2} seconds since epoch`;
            }
            
            const result = this.convert(this.value1, this.fromUnit, this.toUnit);
            return `${this.value1} ${this.unitNames[this.currentTab][this.fromUnit]} = ${result} ${this.unitNames[this.currentTab][this.toUnit]}`;
        }
    },
    methods: {
        formatNumber(value) {
            return Number(value.toFixed(3));
        },
        convert(value, fromUnit, toUnit) {
            if (!value && this.currentTab !== 'Timestamp') return 0;
            
            if (this.currentTab === 'Temperature') {
                const temp = this.conversions.Temperature.F;
                return this.formatNumber(fromUnit === 'F' ? temp.toC(Number(value)) : temp.fromC(Number(value)));
            }
            
            if (this.currentTab === 'Timestamp') {
                const { year, month, day, hour, minute, second } = this.dateTime;
                const date = new Date(year, month - 1, day, hour, minute, second);
                return Math.floor(date.getTime() / 1000);
            }
            
            const conversionRates = this.conversions[this.currentTab];
            const baseValue = value * conversionRates[fromUnit];
            return this.formatNumber(baseValue / conversionRates[toUnit]);
        },
        convertFromFirst() {
            if (this.currentTab === 'Temperature') {
                // Convert from Fahrenheit to Celsius and round to 3 decimal places
                this.value2 = this.formatNumber((this.value1 - 32) * 5/9);
            } else if (this.currentTab === 'Timestamp') {
                this.value2 = this.convert(1, null, null); // Pass a dummy value to trigger conversion
            } else {
                this.value2 = this.convert(this.value1, this.fromUnit, this.toUnit);
            }
            this.updateURL();
        },
        convertFromSecond() {
            if (this.currentTab === 'Temperature') {
                // Convert from Celsius to Fahrenheit and round to 3 decimal places
                this.value1 = this.formatNumber((this.value2 * 9/5) + 32);
            } else if (this.currentTab === 'Timestamp') {
                if (this.value2) {
                    const date = new Date(Number(this.value2) * 1000);
                    this.dateTime = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate(),
                        hour: date.getHours(),
                        minute: date.getMinutes(),
                        second: date.getSeconds()
                    };
                }
            } else {
                // Fix bidirectional conversion by using the correct conversion rates
                const conversionRates = this.conversions[this.currentTab];
                const baseValue = this.value2 * conversionRates[this.toUnit];
                this.value1 = this.formatNumber(baseValue / conversionRates[this.fromUnit]);
            }
            this.updateURL();
        },
        convertTemperature() {
            let result;
            if (this.fromUnit === 'F' && this.toUnit === 'C') {
                result = this.formatNumber((this.value1 - 32) * 5/9);
            } else if (this.fromUnit === 'C' && this.toUnit === 'F') {
                result = this.formatNumber((this.value1 * 9/5) + 32);
            } else {
                result = this.value1;
            }
            return `${this.value1} ${this.fromUnit} = ${result} ${this.toUnit}`;
        },
        updateURL() {
            const params = new URLSearchParams();
            params.set('tab', this.currentTab);
            params.set('value', this.values[this.currentTab].value1);
            
            if (this.currentTab !== 'Temperature') {
                params.set('from', this.fromUnit);
                params.set('to', this.toUnit);
            }
            
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        },
        loadFromURL() {
            const params = new URLSearchParams(window.location.search);
            
            // Set tab if present
            const tab = params.get('tab');
            if (tab && this.tabs.includes(tab)) {
                this.currentTab = tab;
            }
            
            // Set value if present
            const value = params.get('value');
            if (value !== null) {
                this.values[this.currentTab].value1 = Number(value);
            }
            
            // Set units if present and not temperature
            if (this.currentTab !== 'Temperature') {
                const fromUnit = params.get('from');
                const toUnit = params.get('to');
                
                if (fromUnit && this.currentUnits.includes(fromUnit)) {
                    this.fromUnit = fromUnit;
                }
                if (toUnit && this.currentUnits.includes(toUnit)) {
                    this.toUnit = toUnit;
                }
            }
            
            // Perform initial conversion
            this.convertFromFirst();
        }
    },
    mounted() {
        // Set initial units for current tab
        this.fromUnit = this.currentUnits[0]
        this.toUnit = this.currentUnits[1]
        
        // Initialize Timestamp tab with current time if it's the current tab
        if (this.currentTab === 'Timestamp') {
            const now = new Date();
            this.dateTime = {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds()
            };
            // Force initial conversion for timestamp
            this.convertFromFirst();
        }
        
        // Load from URL and perform conversion
        this.loadFromURL()
        
        // Perform initial conversion for current tab
        this.convertFromFirst()
        
        this.$watch(
            () => ({
                tab: this.currentTab,
                value: this.values[this.currentTab].value1,
                from: this.fromUnit,
                to: this.toUnit
            }),
            () => this.updateURL(),
            { deep: true }
        )
    },
    watch: {
        currentTab(newTab) {
            // Set default units first
            this.fromUnit = this.units[newTab][0]
            this.toUnit = this.units[newTab][1]
            
            // Initialize Timestamp tab with current time
            if (newTab === 'Timestamp') {
                const now = new Date();
                this.dateTime = {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                    hour: now.getHours(),
                    minute: now.getMinutes(),
                    second: now.getSeconds()
                };
            } else {
                // Reset values for other tabs if no URL parameters
                const params = new URLSearchParams(window.location.search);
                if (!params.get('value') && this.values[newTab].value1 === 0) {
                    this.values[newTab].value1 = 0
                    this.values[newTab].value2 = 0
                }
            }
            
            // Always perform conversion when switching tabs
            this.convertFromFirst()
        },
        'dateTime.year'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() },
        'dateTime.month'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() },
        'dateTime.day'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() },
        'dateTime.hour'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() },
        'dateTime.minute'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() },
        'dateTime.second'() { if (this.currentTab === 'Timestamp') this.convertFromFirst() }
    }
}).mount('#app') 