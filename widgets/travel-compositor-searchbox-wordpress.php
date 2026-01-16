<?php
/**
 * Plugin Name: Travel Compositor Searchbox
 * Description: Embeddable travel searchbox widget for hero sections
 * Version: 1.0.0
 * Author: AI Website Studio
 * Text Domain: tc-searchbox
 */

if (!defined('ABSPATH')) {
    exit;
}

class TC_Searchbox_Widget {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('travel_searchbox', array($this, 'render_shortcode'));
        add_shortcode('tc_searchbox', array($this, 'render_shortcode'));
    }
    
    public function enqueue_scripts() {
        // jQuery UI
        wp_enqueue_script('jquery-ui-datepicker');
        wp_enqueue_script('jquery-ui-autocomplete');
        wp_enqueue_style('jquery-ui-style', 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.min.css');
        
        // Dutch datepicker locale
        wp_enqueue_script('jquery-ui-datepicker-nl', 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.8.18/i18n/jquery.ui.datepicker-nl.min.js', array('jquery-ui-datepicker'));
        
        // Font Awesome
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        // Widget styles
        wp_add_inline_style('jquery-ui-style', $this->get_widget_css());
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'microsite' => 'rondreis-planner',
            'base_url' => 'https://rondreis-planner.nl',
            'tabs' => 'tripplanner,ai,flighthotel,hotel,routing,car',
            'primary_color' => '#066168',
            'show_ai' => 'true',
        ), $atts);
        
        $tabs = array_map('trim', explode(',', $atts['tabs']));
        
        ob_start();
        ?>
        <div class="tc-searchbox-widget" 
             data-microsite="<?php echo esc_attr($atts['microsite']); ?>" 
             data-base-url="<?php echo esc_attr($atts['base_url']); ?>"
             style="--tc-primary: <?php echo esc_attr($atts['primary_color']); ?>">
            
            <!-- Tabs -->
            <div class="tc-tabs">
                <?php if (in_array('tripplanner', $tabs)): ?>
                <button class="tc-tab active" data-panel="tripplanner">
                    <i class="fa-light fa-map-location-dot"></i>
                    <span>Trip Planner</span>
                </button>
                <?php endif; ?>
                
                <?php if (in_array('ai', $tabs) && $atts['show_ai'] === 'true'): ?>
                <button class="tc-tab" data-panel="ai">
                    <i class="fa-light fa-microchip-ai"></i>
                    <span>AI Planner</span>
                </button>
                <?php endif; ?>
                
                <?php if (in_array('flighthotel', $tabs)): ?>
                <button class="tc-tab" data-panel="flighthotel">
                    <i class="fa-light fa-plane-departure"></i>
                    <span>Vlucht + Hotel</span>
                </button>
                <?php endif; ?>
                
                <?php if (in_array('hotel', $tabs)): ?>
                <button class="tc-tab" data-panel="hotel">
                    <i class="fa-light fa-bed-front"></i>
                    <span>Accommodatie</span>
                </button>
                <?php endif; ?>
                
                <?php if (in_array('routing', $tabs)): ?>
                <button class="tc-tab" data-panel="routing">
                    <i class="fa-light fa-route"></i>
                    <span>Fly & Drive</span>
                </button>
                <?php endif; ?>
                
                <?php if (in_array('car', $tabs)): ?>
                <button class="tc-tab" data-panel="car">
                    <i class="fa-light fa-car"></i>
                    <span>Huurauto</span>
                </button>
                <?php endif; ?>
            </div>
            
            <!-- Content -->
            <div class="tc-content">
                
                <!-- Trip Planner Panel -->
                <?php if (in_array('tripplanner', $tabs)): ?>
                <div class="tc-panel active" id="panel-tripplanner">
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-tripplanner-date" placeholder="Vertrekdatum">
                        </div>
                        <div class="tc-input-group tc-room-selector">
                            <i class="fa-light fa-users"></i>
                            <button type="button" class="tc-room-trigger" id="tc-room-trigger">
                                <span class="tc-room-summary">2 Volwassenen, 1 Kamer</span>
                            </button>
                            <div class="tc-room-dropdown" id="tc-room-dropdown">
                                <div class="tc-room-row">
                                    <div class="tc-room-label">Volwassenen<small>18 jaar en ouder</small></div>
                                    <div class="tc-counter">
                                        <button type="button" class="tc-counter-btn" data-action="decrease" data-target="adults">−</button>
                                        <span class="tc-counter-value" id="tc-adults">2</span>
                                        <button type="button" class="tc-counter-btn" data-action="increase" data-target="adults">+</button>
                                    </div>
                                </div>
                                <div class="tc-room-row">
                                    <div class="tc-room-label">Kinderen<small>0-17 jaar</small></div>
                                    <div class="tc-counter">
                                        <button type="button" class="tc-counter-btn" data-action="decrease" data-target="children">−</button>
                                        <span class="tc-counter-value" id="tc-children">0</span>
                                        <button type="button" class="tc-counter-btn" data-action="increase" data-target="children">+</button>
                                    </div>
                                </div>
                                <div class="tc-room-row">
                                    <div class="tc-room-label">Kamers</div>
                                    <div class="tc-counter">
                                        <button type="button" class="tc-counter-btn" data-action="decrease" data-target="rooms">−</button>
                                        <span class="tc-counter-value" id="tc-rooms">1</span>
                                        <button type="button" class="tc-counter-btn" data-action="increase" data-target="rooms">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="tc-submit" onclick="TCWidget.searchTripPlanner()">
                            <i class="fa-solid fa-search"></i> Zoeken
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- AI Planner Panel -->
                <?php if (in_array('ai', $tabs) && $atts['show_ai'] === 'true'): ?>
                <div class="tc-panel" id="panel-ai">
                    <div class="tc-form-row">
                        <div class="tc-input-group" style="grid-column: 1 / -1;">
                            <input type="text" class="tc-ai-input" id="tc-ai-description" 
                                   placeholder="Beschrijf je droomreis... (bijv. 'Een romantische week in Italië')">
                        </div>
                    </div>
                    <div class="tc-form-row" style="justify-content: flex-end;">
                        <button type="button" class="tc-submit" onclick="TCWidget.searchAI()">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Plan met AI
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Flight + Hotel Panel -->
                <?php if (in_array('flighthotel', $tabs)): ?>
                <div class="tc-panel" id="panel-flighthotel">
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-plane-departure"></i>
                            <input type="text" class="tc-input tc-autocomplete-origin" id="tc-fh-origin" placeholder="Vertrek vanaf">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-map-marker-alt"></i>
                            <input type="text" class="tc-input tc-autocomplete-dest" id="tc-fh-destination" placeholder="Bestemming">
                        </div>
                    </div>
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-fh-checkin" placeholder="Check-in">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-fh-checkout" placeholder="Check-out">
                        </div>
                        <button type="button" class="tc-submit" onclick="TCWidget.searchFlightHotel()">
                            <i class="fa-solid fa-search"></i> Zoeken
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Hotel Only Panel -->
                <?php if (in_array('hotel', $tabs)): ?>
                <div class="tc-panel" id="panel-hotel">
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-map-marker-alt"></i>
                            <input type="text" class="tc-input tc-autocomplete-dest" id="tc-hotel-destination" placeholder="Bestemming of hotelnaam">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-hotel-checkin" placeholder="Check-in">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-hotel-checkout" placeholder="Check-out">
                        </div>
                        <button type="button" class="tc-submit" onclick="TCWidget.searchHotel()">
                            <i class="fa-solid fa-search"></i> Zoeken
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Fly & Drive Panel -->
                <?php if (in_array('routing', $tabs)): ?>
                <div class="tc-panel" id="panel-routing">
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-plane-departure"></i>
                            <input type="text" class="tc-input tc-autocomplete-origin" id="tc-routing-origin" placeholder="Vertrek vanaf">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-map-marker-alt"></i>
                            <input type="text" class="tc-input tc-autocomplete-dest" id="tc-routing-destination" placeholder="Bestemming">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-routing-date" placeholder="Vertrekdatum">
                        </div>
                        <button type="button" class="tc-submit" onclick="TCWidget.searchRouting()">
                            <i class="fa-solid fa-search"></i> Zoeken
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Car Rental Panel -->
                <?php if (in_array('car', $tabs)): ?>
                <div class="tc-panel" id="panel-car">
                    <div class="tc-form-row">
                        <div class="tc-input-group">
                            <i class="fa-light fa-map-marker-alt"></i>
                            <input type="text" class="tc-input tc-autocomplete-car" id="tc-car-pickup" placeholder="Ophaallocatie">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-car-pickup-date" placeholder="Ophaaldatum">
                        </div>
                        <div class="tc-input-group">
                            <i class="fa-light fa-calendar-alt"></i>
                            <input type="text" class="tc-input tc-datepicker" id="tc-car-return-date" placeholder="Inleverdatum">
                        </div>
                        <button type="button" class="tc-submit" onclick="TCWidget.searchCar()">
                            <i class="fa-solid fa-search"></i> Zoeken
                        </button>
                    </div>
                </div>
                <?php endif; ?>
                
            </div>
        </div>
        
        <script>
        <?php echo $this->get_widget_js(); ?>
        </script>
        <?php
        return ob_get_clean();
    }
    
    private function get_widget_css() {
        return '
        :root {
            --tc-primary: #066168;
            --tc-secondary: #85D200;
            --tc-white: #ffffff;
            --tc-light: #f8fafc;
            --tc-dark: #1e293b;
            --tc-gray: #64748b;
            --tc-border: #e2e8f0;
            --tc-radius: 12px;
            --tc-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .tc-searchbox-widget {
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: var(--tc-radius);
            box-shadow: var(--tc-shadow);
            overflow: hidden;
        }
        
        .tc-searchbox-widget * {
            box-sizing: border-box;
        }
        
        .tc-tabs {
            display: flex;
            flex-wrap: wrap;
            background: var(--tc-light);
            border-bottom: 1px solid var(--tc-border);
            padding: 8px 8px 0;
            gap: 4px;
        }
        
        .tc-tab {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: transparent;
            border: none;
            border-radius: 8px 8px 0 0;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: var(--tc-gray);
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .tc-tab:hover {
            background: rgba(6, 97, 104, 0.1);
            color: var(--tc-primary);
        }
        
        .tc-tab.active {
            background: var(--tc-white);
            color: var(--tc-primary);
            border: 1px solid var(--tc-border);
            border-bottom-color: var(--tc-white);
            margin-bottom: -1px;
        }
        
        .tc-tab i { font-size: 14px; }
        
        .tc-content { padding: 20px; }
        
        .tc-panel { display: none; }
        .tc-panel.active { display: block; }
        
        .tc-form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .tc-input-group {
            position: relative;
        }
        
        .tc-input-group i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--tc-gray);
            font-size: 14px;
            pointer-events: none;
        }
        
        .tc-input, .tc-select {
            width: 100%;
            padding: 12px 12px 12px 38px;
            border: 1px solid var(--tc-border);
            border-radius: 8px;
            font-size: 14px;
            color: var(--tc-dark);
            background: var(--tc-white);
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .tc-input:focus, .tc-select:focus {
            outline: none;
            border-color: var(--tc-primary);
            box-shadow: 0 0 0 3px rgba(6, 97, 104, 0.1);
        }
        
        .tc-room-selector { position: relative; }
        
        .tc-room-trigger {
            width: 100%;
            padding: 12px 12px 12px 38px;
            border: 1px solid var(--tc-border);
            border-radius: 8px;
            font-size: 14px;
            color: var(--tc-dark);
            background: var(--tc-white);
            cursor: pointer;
            text-align: left;
        }
        
        .tc-room-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--tc-white);
            border: 1px solid var(--tc-border);
            border-radius: 8px;
            box-shadow: var(--tc-shadow);
            padding: 16px;
            z-index: 100;
            margin-top: 4px;
        }
        
        .tc-room-dropdown.open { display: block; }
        
        .tc-room-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--tc-border);
        }
        
        .tc-room-row:last-child { border-bottom: none; }
        
        .tc-room-label {
            font-size: 14px;
            color: var(--tc-dark);
        }
        
        .tc-room-label small {
            display: block;
            color: var(--tc-gray);
            font-size: 12px;
        }
        
        .tc-counter {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .tc-counter-btn {
            width: 32px;
            height: 32px;
            border: 1px solid var(--tc-border);
            border-radius: 50%;
            background: var(--tc-white);
            cursor: pointer;
            font-size: 16px;
            color: var(--tc-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .tc-counter-btn:hover {
            background: var(--tc-primary);
            color: var(--tc-white);
        }
        
        .tc-counter-value {
            min-width: 24px;
            text-align: center;
            font-weight: 600;
        }
        
        .tc-submit {
            padding: 12px 32px;
            background: var(--tc-primary);
            color: var(--tc-white);
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }
        
        .tc-submit:hover { background: #055058; }
        .tc-submit:active { transform: scale(0.98); }
        
        .tc-ai-input {
            padding: 12px 16px;
            border: 2px dashed var(--tc-border);
            border-radius: 8px;
            font-size: 14px;
            width: 100%;
        }
        
        .tc-ai-input:focus {
            outline: none;
            border-color: var(--tc-primary);
            border-style: solid;
        }
        
        @media (max-width: 768px) {
            .tc-tabs {
                overflow-x: auto;
                flex-wrap: nowrap;
            }
            .tc-tab span { display: none; }
            .tc-tab { padding: 10px 14px; }
            .tc-form-row { grid-template-columns: 1fr; }
            .tc-submit { width: 100%; justify-content: center; }
        }
        
        .ui-datepicker {
            font-family: inherit;
            border-radius: 8px;
            box-shadow: var(--tc-shadow);
        }
        
        .ui-datepicker-header {
            background: var(--tc-primary);
            border: none;
            border-radius: 8px 8px 0 0;
        }
        ';
    }
    
    private function get_widget_js() {
        return '
        const TCWidget = (function() {
            "use strict";
            
            const config = {
                microsite: "rondreis-planner",
                baseUrl: "https://rondreis-planner.nl",
                language: "NL",
                currency: "EUR"
            };
            
            const state = { adults: 2, children: 0, rooms: 1, childAges: [] };
            
            function init() {
                const widget = document.querySelector(".tc-searchbox-widget");
                if (widget) {
                    config.microsite = widget.dataset.microsite || config.microsite;
                    config.baseUrl = widget.dataset.baseUrl || config.baseUrl;
                }
                initTabs();
                initDatepickers();
                initRoomSelector();
            }
            
            function initTabs() {
                document.querySelectorAll(".tc-tab").forEach(tab => {
                    tab.addEventListener("click", function() {
                        const panelId = this.dataset.panel;
                        document.querySelectorAll(".tc-tab").forEach(t => t.classList.remove("active"));
                        this.classList.add("active");
                        document.querySelectorAll(".tc-panel").forEach(p => p.classList.remove("active"));
                        document.getElementById("panel-" + panelId)?.classList.add("active");
                    });
                });
            }
            
            function initDatepickers() {
                const minDate = new Date();
                minDate.setDate(minDate.getDate() + 3);
                jQuery(".tc-datepicker").datepicker({
                    dateFormat: "dd-mm-yy",
                    minDate: minDate,
                    numberOfMonths: window.innerWidth > 768 ? 2 : 1
                });
            }
            
            function initRoomSelector() {
                const trigger = document.getElementById("tc-room-trigger");
                const dropdown = document.getElementById("tc-room-dropdown");
                if (trigger && dropdown) {
                    trigger.addEventListener("click", e => {
                        e.stopPropagation();
                        dropdown.classList.toggle("open");
                    });
                    document.addEventListener("click", e => {
                        if (!dropdown.contains(e.target) && e.target !== trigger) {
                            dropdown.classList.remove("open");
                        }
                    });
                    document.querySelectorAll(".tc-counter-btn").forEach(btn => {
                        btn.addEventListener("click", function() {
                            const action = this.dataset.action;
                            const target = this.dataset.target;
                            if (action === "increase") {
                                if (target === "adults" && state.adults < 9) state.adults++;
                                if (target === "children" && state.children < 6) state.children++;
                                if (target === "rooms" && state.rooms < 5) state.rooms++;
                            } else {
                                if (target === "adults" && state.adults > 1) state.adults--;
                                if (target === "children" && state.children > 0) state.children--;
                                if (target === "rooms" && state.rooms > 1) state.rooms--;
                            }
                            updateRoomDisplay();
                        });
                    });
                }
                updateRoomDisplay();
            }
            
            function updateRoomDisplay() {
                document.getElementById("tc-adults").textContent = state.adults;
                document.getElementById("tc-children").textContent = state.children;
                document.getElementById("tc-rooms").textContent = state.rooms;
                const summary = state.adults + " Volwassenen" + (state.children > 0 ? ", " + state.children + " Kind" + (state.children > 1 ? "eren" : "") : "") + ", " + state.rooms + " Kamer" + (state.rooms > 1 ? "s" : "");
                document.querySelector(".tc-room-summary").textContent = summary;
            }
            
            function getDistribution() {
                let dist = "";
                for (let i = 0; i < state.rooms; i++) {
                    if (i > 0) dist += "|";
                    dist += state.adults;
                }
                return dist || state.adults.toString();
            }
            
            function formatDateForUrl(dateStr) {
                if (!dateStr) return "";
                const parts = dateStr.split("-");
                if (parts.length === 3) return parts[2] + "-" + parts[1] + "-" + parts[0];
                return dateStr;
            }
            
            function searchTripPlanner() {
                const date = formatDateForUrl(jQuery("#tc-tripplanner-date").val());
                if (!date) { alert("Selecteer een vertrekdatum"); return; }
                const url = config.baseUrl + "/tripplanner?departureDate=" + date + "&distribution=" + getDistribution() + "&language=" + config.language;
                window.open(url, "_blank");
            }
            
            function searchAI() {
                const description = jQuery("#tc-ai-description").val();
                if (!description) { alert("Beschrijf je droomreis"); return; }
                const url = config.baseUrl + "/ai-trip?description=" + encodeURIComponent(description) + "&language=" + config.language;
                window.open(url, "_blank");
            }
            
            function searchFlightHotel() {
                const origin = jQuery("#tc-fh-origin").val();
                const destination = jQuery("#tc-fh-destination").val();
                const checkin = formatDateForUrl(jQuery("#tc-fh-checkin").val());
                const checkout = formatDateForUrl(jQuery("#tc-fh-checkout").val());
                if (!origin || !destination || !checkin || !checkout) { alert("Vul alle velden in"); return; }
                const url = config.baseUrl + "/flight-hotel?origin=" + encodeURIComponent(origin) + "&destination=" + encodeURIComponent(destination) + "&departureDate=" + checkin + "&returnDate=" + checkout + "&distribution=" + getDistribution();
                window.open(url, "_blank");
            }
            
            function searchHotel() {
                const destination = jQuery("#tc-hotel-destination").val();
                const checkin = formatDateForUrl(jQuery("#tc-hotel-checkin").val());
                const checkout = formatDateForUrl(jQuery("#tc-hotel-checkout").val());
                if (!destination || !checkin || !checkout) { alert("Vul alle velden in"); return; }
                const url = config.baseUrl + "/hotel?destination=" + encodeURIComponent(destination) + "&departureDate=" + checkin + "&returnDate=" + checkout + "&distribution=" + getDistribution();
                window.open(url, "_blank");
            }
            
            function searchRouting() {
                const origin = jQuery("#tc-routing-origin").val();
                const destination = jQuery("#tc-routing-destination").val();
                const date = formatDateForUrl(jQuery("#tc-routing-date").val());
                if (!origin || !destination || !date) { alert("Vul alle velden in"); return; }
                const url = config.baseUrl + "/routing?origin=" + encodeURIComponent(origin) + "&destination=" + encodeURIComponent(destination) + "&departureDate=" + date + "&routingType=FLIGHT_PLUS_CAR&distribution=" + getDistribution();
                window.open(url, "_blank");
            }
            
            function searchCar() {
                const pickup = jQuery("#tc-car-pickup").val();
                const pickupDate = formatDateForUrl(jQuery("#tc-car-pickup-date").val());
                const returnDate = formatDateForUrl(jQuery("#tc-car-return-date").val());
                if (!pickup || !pickupDate || !returnDate) { alert("Vul alle velden in"); return; }
                const url = config.baseUrl + "/car-rental?pickupLocation=" + encodeURIComponent(pickup) + "&pickupDate=" + pickupDate + "&dropoffDate=" + returnDate;
                window.open(url, "_blank");
            }
            
            jQuery(document).ready(init);
            
            return {
                searchTripPlanner: searchTripPlanner,
                searchAI: searchAI,
                searchFlightHotel: searchFlightHotel,
                searchHotel: searchHotel,
                searchRouting: searchRouting,
                searchCar: searchCar
            };
        })();
        ';
    }
}

// Initialize
TC_Searchbox_Widget::get_instance();
