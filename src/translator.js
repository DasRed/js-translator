class Translator {
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
     * @param {Object} [options]
     * @param {BBCode} [options.bbCodeParser]
     * @param {String} [options.locale]
     * @param {String} [options.localeArea]
     * @param {String} [options.localeDefault]
     * @param {RegExp} [options.regexpParameters]
     * @param {RegExp} [options.regexpTranslations]
     */
    constructor(translations, options) {
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

        this.bbCodeParser       = options.bbCodeParser;
        this.locale             = options.locale !== undefined ? options.locale : 'en-GB';
        this.localeArea         = options.localeArea !== undefined ? options.localeArea : this.locale;
        this.localeDefault      = options.localeDefault !== undefined ? options.localeDefault : this.locale;
        this.regexpParameters   = options.regexpParameters !== undefined ? options.regexpParameters : /\\?\[([^\[\]]+)\]/g;
        this.regexpTranslations = options.regexpTranslations !== undefined ? options.regexpTranslations : /[\\\$]?\{([^{}]+)\}/g;

        this.setTranslations(translations);
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
        // merge given into translator
        for (let locale in translations) {
            if (this.translations[locale] === undefined) {
                this.translations[locale] = {};
            }

            for (let trKey in translations[locale]) {
                this.translations[locale][trKey] = translations[locale][trKey];
            }
        }

        return this;
    }

    /**
     *
     * @param {String} key
     * @param {String} [defaults]
     * @return {*}
     */
    getValueFromKey(key, defaults) {
        let text = this.translation[key];
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

const translator = new Translator({});

translator.create = Translator;

export default translator;
