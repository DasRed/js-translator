(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../node_modules/js-bbcode-parser/src/parser.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../node_modules/js-bbcode-parser/src/parser.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.parser);
        global.translator = mod.exports;
    }
})(this, function (exports, _parser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _parser2 = _interopRequireDefault(_parser);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Translator = function () {
        _createClass(Translator, [{
            key: 'translation',
            get: function get() {
                if (this.translations[this.locale] !== undefined) {
                    return this.translations[this.locale];
                }

                if (this.translations[this.localeArea] !== undefined) {
                    return this.translations[this.localeArea];
                }

                if (this.translations[this.localeDefault] !== undefined) {
                    return this.translations[this.localeDefault];
                }

                return {};
            }
        }]);

        /**
         * @param {Object} translations
         * @param {Object} [options]
         * @param {String} [options.locale]
         * @param {String} [options.localeArea]
         * @param {String} [options.localeDefault]
         * @param {RegExp} [options.regexpParameters]
         * @param {RegExp} [options.regexpTranslations]
         */
        function Translator(translations, options) {
            _classCallCheck(this, Translator);

            /**
             * all translations in structure. structure is
             *    LOCALE:
             *        TRKEY => VALUE
             *        ...
             *
             * TRKEY is defined bei "TRFILE.TRINDEX" given from backend
             *
             * @var {Object}
             */
            this.translations = {};

            options = options || {};

            this.locale = options.locale !== undefined ? options.locale : 'en-GB';
            this.localeArea = options.localeArea !== undefined ? options.localeArea : this.locale;
            this.localeDefault = options.localeDefault !== undefined ? options.localeDefault : this.locale;
            this.regexpParameters = options.regexpParameters !== undefined ? options.regexpParameters : /\\?\[([^\[\]]+)\]/g;
            this.regexpTranslations = options.regexpTranslations !== undefined ? options.regexpTranslations : /[\\\$]?\{([^{}]+)\}/g;

            this.setTranslations(translations);
        }

        /**
         * set Translations
         *
         * @param {Object} translations
         * @returns {Translator}
         */


        _createClass(Translator, [{
            key: 'setTranslations',
            value: function setTranslations(translations) {
                // merge given into translator
                for (var locale in translations) {
                    if (this.translations[locale] === undefined) {
                        this.translations[locale] = {};
                    }

                    for (var trKey in translations[locale]) {
                        this.translations[locale][trKey] = translations[locale][trKey];
                    }
                }

                return this;
            }
        }, {
            key: 'getValueFromKey',
            value: function getValueFromKey(key, defaults) {
                var text = this.translation[key];
                if (text === undefined && this.translations[this.localeArea] !== undefined) {
                    text = this.translations[this.localeArea][key];
                }

                if (text === undefined && this.translations[this.localeDefault] !== undefined) {
                    text = this.translations[this.localeDefault][key];
                }

                if (text === undefined) {
                    if (defaults === undefined) {
                        return '{' + key + '}';
                    }
                    text = defaults;
                }

                return text;
            }
        }, {
            key: 'translate',
            value: function translate(key, parameters, defaults) {
                if (key === undefined || key === null) {
                    return key;
                }

                if (key.charAt(0) === '{') {
                    key = key.slice(1);
                }
                if (key.charAt(key.length - 1) === '}') {
                    key = key.slice(0, key.length - 1);
                }

                var text = this.getValueFromKey(key, defaults);
                if (text === null || text === undefined) {
                    return text;
                }

                if (typeof text !== 'string') {
                    return text;
                }

                // parameter replacement
                if (parameters instanceof Object) {
                    text = Object.keys(parameters).reduce(function (acc, name) {
                        return acc.replace(new RegExp('\\[' + name + '\\]', 'gi'), parameters[name]);
                    }, text);
                }

                return _parser2.default.default.parse(text);
            }
        }, {
            key: 'translateInline',
            value: function translateInline(text) {
                var _this = this;

                // replace the text
                text = text.replace(this.regexpTranslations, function (match, key) {
                    switch (match.charAt(0)) {
                        case '\\':
                            return match.slice(1);
                        case '$':
                            return match;
                    }

                    return _this.translate(key, undefined, match);
                });

                return text;
            }
        }]);

        return Translator;
    }();

    /**
     * create a default translator
     * @type {Translator}
     */
    Translator.default = new Translator({});

    /**
     * Define config function
     * @type {Function}
     * @param {Object} translations
     * @returns {Translator}
     */
    Translator.setTranslations = Translator.default.setTranslations.bind(Translator.default);

    exports.default = Translator;
});