export default class Translator {
    /**
     *
     * @return {Object}
     */
    get translation() {
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

    /**
     * @param {Object} translations
     * @param {BBCode} [bbCodeParser]
     * @param {String} [locale]
     * @param {String} [localeArea]
     * @param {String} [localeDefault]
     * @param {RegExp} [regexpParameters]
     * @param {RegExp} [regexpTranslations]
     */
    constructor(translations, {
        bbCodeParser = undefined,
        locale = 'en-GB',
        localeArea = 'en-GB',
        localeDefault = 'en-GB',
        regexpParameters = /\\?\[([^\[\]]+)\]/g,
        regexpTranslations = /[\\\$]?\{([^{}]+)\}/g,
    }) {
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

        this.bbCodeParser       = bbCodeParser;
        this.locale             = locale;
        this.localeArea         = localeArea;
        this.localeDefault      = localeDefault;
        this.regexpParameters   = regexpParameters;
        this.regexpTranslations = regexpTranslations;

        this.setTranslations(translations);
    }

    /**
     *
     * @param {String} key
     * @param {String} [defaults]
     * @return {*}
     */
    getValueFromKey(key, defaults) {
        const keys = key.split('.');

        let text = keys.reduce((acc, entry) => acc[entry] ?? undefined, this.translation);
        if (text === undefined && this.translations[this.localeArea] !== undefined) {
            text = keys.reduce((acc, entry) => acc[entry] ?? undefined, this.translations[this.localeArea]);
        }

        if (text === undefined && this.translations[this.localeDefault] !== undefined) {
            text = keys.reduce((acc, entry) => acc[entry] ?? undefined, this.translations[this.localeDefault]);
        }

        if (text === undefined) {
            if (defaults === undefined) {
                return '{' + key + '}';
            }
            text = defaults;
        }

        return text;
    }

    /**
     *
     * @param {BBCode} bbCodeParser
     * @return {Translator}
     */
    setBBCodeParser(bbCodeParser) {
        this.bbCodeParser = bbCodeParser;

        return this;
    }

    /**
     * set Translations
     *
     * @param {Object} translations
     * @returns {Translator}
     */
    setTranslations(translations) {
        Object.entries(translations).forEach(([locale, values]) => {
            if (this.translations[locale] === undefined) {
                this.translations[locale] = {};
            }

            this.translations[locale] = {...values};
        });

        return this;
    }

    /**
     * translate a text with given parameters
     *
     * @param {String} key
     * @param {Object} [parameters]
     * @param {String} [defaults]
     * @returns {String}
     */
    translate(key, parameters, defaults) {
        if (key === undefined || key === null) {
            return key;
        }

        if (key.charAt(0) === '{') {
            key = key.slice(1);
        }
        if (key.charAt(key.length - 1) === '}') {
            key = key.slice(0, key.length - 1);
        }

        let text = this.getValueFromKey(key, defaults);
        if (text === null || text === undefined) {
            return text;
        }

        if (typeof text !== 'string') {
            return text;
        }

        // parameter replacement
        if (parameters instanceof Object) {
            text = Object.keys(parameters).reduce((acc, name) => acc.replace(new RegExp('\\[' + name + '\\]', 'gi'), parameters[name]), text);
        }

        if (this.bbCodeParser === undefined) {
            return text;
        }

        return this.bbCodeParser.parse(text);
    };

    /**
     * inline translation
     *
     * @param {String} text
     * @returns {String}
     */
    translateInline(text) {
        // replace the text
        text = text.replace(this.regexpTranslations, (match, key) => {
            switch (match.charAt(0)) {
                case '\\':
                    return match.slice(1);
                case '$':
                    return match;
            }

            return this.translate(key, undefined, match);
        });

        return text;
    };
}
