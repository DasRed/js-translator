# translator
# General
This is a simple translation engine. 

# Installation
```bash
bower install translator --save
npm install js-translator --save
```

# Usage
## Config structure
The [translator](src/translator.js) requires at least 2 arguments. The first argument is the translation config. The second argument are the options. 

The following structure for translation config will be used.

```text
|--- de_DE
       |--- KEY: VALUE
       |--- KEY: VALUE
       |--- KEY: VALUE
|--- en_GB
       |--- KEY: VALUE
       |--- KEY: VALUE
       |--- KEY: VALUE
```

The following example show the translation config
```json
{
    "de-DE": {
        "buttonAbort": "Änderungen verwerfen",
        "buttonAccept": "Übernehmen",
        "buttonCancel": "Abbrechen",
        "buttonOkay": "Okay"
    },
    "fr-FR": {
        "buttonAbort": "Annuler les modifications",
        "buttonAccept": "Sauvegarder",
        "buttonCancel": "Annuler",
        "buttonOkay": "Ok"
    },
    "nl-NL": {
        "buttonAbort": "Wijzigingen verwerpen",
        "buttonAccept": "Overnemen",
        "buttonCancel": "Afbreken",
        "buttonOkay": "Oké"
    }
}
```

The second arguments contains some options:
- locale ... current defined locale. Default en-GB
- localeArea ... current language area locale. Default en-GB
- localeDefault ... current default locale. Default en-GB
- regexpParameters ... regexp to transform parameters in translations into object template property. Default /\\?\[([^\[\]]+)\]/g 
- regexpTranslations ... regexp for translations identify in inline text. Default /[\\\$]?\{([^{}]+)\}/g

### Locales example
If you have some translations for de-DE, de-AT and en-GB and en-GB is your default locale, which always contains every key.
Following configuration will be used:
- locale: de-AT
- localeArea: de-DE
- localeDefault: en-GB

Your translation will be now done in de-AT. But if key not exists in de-AT, the translator will take a look into the localeArea to find the key. In this case it will be taken from de-DE.
This is the handling of same languages (in this case german) with some differences.

If the translation key not exists in the localeArea, the translator will try to find the translation in the localeDefault. In this case it will be taken from en-GB.
This is the handling for default language. So you can always present a text.

If the key does not exists in the current locale, the locale area and the default locale the translator will return the translation key as the translation text.

## Placeholders

Translation values can have placeholder. Every placeholder is embeded in [ and ]. The placeholder key is case insensitive. 

The following example shows with placeholders.
```json
{
    "de-DE": {
        "buttonAbort": "Änderungen verwerfen",
        "buttonAccept": "Übernehmen",
        "buttonCancel": "Abbrechen",
        "buttonOkay": "Okay",
        "price": "[VALUE] €"
    },
    "fr-FR": {
        "buttonAbort": "Annuler les modifications",
        "buttonAccept": "Sauvegarder",
        "buttonCancel": "Annuler",
        "buttonOkay": "Ok",
        "price": "[VALUE] €"
    },
    "nl-NL": {
        "buttonAbort": "Wijzigingen verwerpen",
        "buttonAccept": "Overnemen",
        "buttonCancel": "Afbreken",
        "buttonOkay": "Oké",
        "price": "[VALUE] €"
    }
}
```

Example of requesting programmatically a translation key with parameters.
```js
let translator = new Translator(translationConfig, {locale: 'fr-FR', localeDefault: 'de-DE'});
console.log(translator.translate('price', {value: '10.11'})); // 10.11 €
console.log(translator.translate('price')); // [VALUE] €
```

## Translation
You can translation with the "translate" function with given parameter.
```javascript
import translator from 'translator';

let translatorA = translator.create(translationConfig, {locale: 'fr-FR', localeDefault: 'de-DE'});
console.log(translator.translate('price', {value: '10.11'})); // 10.11 €
console.log(translator.translate('price')); // [VALUE] €
```

You can also translate a text (may it is HTML) with inline translations
```json
{
    "de-DE": {
        "buttonAbort": "Änderungen verwerfen",
        "buttonAccept": "Übernehmen",
        "buttonCancel": "Abbrechen",
        "buttonOkay": "Okay",
        "message": "Wirklich?"
    },
    "fr-FR": {
        "buttonAbort": "Annuler les modifications",
        "buttonAccept": "Sauvegarder",
        "buttonCancel": "Annuler",
        "buttonOkay": "Ok",
        "message": "Vraiment?"
    },
    "nl-NL": {
        "buttonAbort": "Wijzigingen verwerpen",
        "buttonAccept": "Overnemen",
        "buttonCancel": "Afbreken",
        "buttonOkay": "Oké",
        "message": "Echt?"
    }
}
```
```html
<form>
    <span>{message}</span>
    <button type="submit">{buttonOkay}</button>
    <button type="button">{buttonCancel}</button>
</form>
```
```javascript
import translator from 'translator';

let translatorA = translator.create(translationConfig, {locale: 'fr-FR', localeDefault: 'de-DE'});
console.log(translator.translateInline(html));
```

**Output**
```html
<form>
    <span>Vraiment?</span>
    <button type="submit">Ok</button>
    <button type="button">Annuler</button>
</form>
```

## Default Translator
A default translator with default configuration and no translation keys is available. This default translator is used in the [js-translator-lodash-bridge](https://github.com/DasRed/js-translator-lodash-bridge) and [js-translator-lodash-requirejs-bridge](https://github.com/DasRed/js-translator-lodash-requirejs-bridge).
You can configure this translator:
```javascript
import translator from 'translator';

translator.setTranslations(translationConfig);
translator.locale = 'de-AT';
translator.localeArea = 'de-DE';
translator.localeDefault = 'en-GB';
```
