'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['bbcode-parser'], function (BBCode) {
            return factory(BBCode);
        });

    } else if (typeof exports !== 'undefined') {
        root.Translator = factory(root.BBCode);

    } else {
        root.Translator = factory(root.BBCode);
    }
}(this, function (BBCode) {
    /**
     * Translator
     *
     * @param {Object} translations
     * @param {Object} options
     */
    function Translator(translations, options) {
        this.translations = {};

        options = options || {};

        this.locale             = options.locale !== undefined ? options.locale : this.locale;
        this.regexpParameters   = options.regexpParameters !== undefined ? options.regexpParameters : this.regexpParameters;
        this.regexpTranslations = options.regexpTranslations !== undefined ? options.regexpTranslations : this.regexpTranslations;

        this.setTranslations(translations);
    }

    // prototype
    Translator.prototype = Object.create(Object.prototype, {
        /**
         * current defined locale
         *
         * @var {String}
         */
        locale: {
            value: 'en-GB',
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * regexp to transform parameters in translations into object template property
         *
         * @var {RegExp}
         */
        regexpParameters: {
            value: /\\?\[([^\[\]]+)\]/g,
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * regexp for translations identify
         *
         * @var {RegExp}
         */
        regexpTranslations: {
            value: /[\\\$]?\{([^{}]+)\}/g,
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * translation for the current locale
         *
         * @var {Object}
         */
        translation: {
            enumerable: false,
            configurable: false,
            get: function () {
                if (this.translations[this.locale] === undefined) {
                    return {};
                }
                return this.translations[this.locale];
            }
        },

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
        translations: {
            value: null,
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * set Translations
         *
         * @param {Object} translations
         * @returns {Translator}
         */
        setTranslations: {
            value: function (translations) {
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
            },
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * translate a text with given parameters
         *
         * @param {String} key
         * @param {Object} parameters
         * @param {String} defaults
         * @returns {String}
         */
        translate: {
            value: function (key, parameters, defaults) {
                if (key === undefined || key === null) {
                    return key;
                }

                if (key.charAt(0) === '{') {
                    key = key.slice(1);
                }
                if (key.charAt(key.length - 1) === '}') {
                    key = key.slice(0, key.length - 1);
                }

                var text = this.translation[key];
                if (text === undefined) {
                    if (defaults === undefined) {
                        return '{' + key + '}';
                    }
                    text = defaults;
                }

                // parameter replacement
                text = Object.keys(parameters).reduce(function (acc, name) {
                    var value = parameters[name];

                    return acc.replace(new RegExp('\\[' + name + '\\]', 'gi'), value);
                }, text);

                return BBCode.default.parse(text);
            },
            enumerable: false,
            configurable: false,
            writable: true
        },

        /**
         * inline translation
         *
         * @param {String} text
         * @returns {String}
         */
        translateInline: {
            value: function (text) {
                var self = this;

                // replace the text
                text = text.replace(this.regexpTranslations, function (match, key) {
                    switch (match.charAt(0)) {
                        case '\\':
                            return match.slice(1);
                        case '$':
                            return match;
                    }

                    return self.translate(key, undefined, match);
                });

                return text;
            },
            enumerable: false,
            configurable: false,
            writable: true
        }
    });

    // create a default translator
    Translator.default = new Translator({});

    // Define config function
    Translator.setTranslations = Translator.default.setTranslations.bind(Translator.default);

    return Translator;
}));
