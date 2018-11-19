angular.module('translate')
.factory('translate', ['$http', function($http){
    var lastWord="";
    var key = "7c20485e6c6d49fc80cbc38a05843d99";
    var language = 'uk';

    function getDatamuseSuggestions(term) {
        return $http.get('https://api.datamuse.com/sug',
            {
                params: { s: term },
                transformResponse: function(data) {
                    var jsonData = JSON.parse(data);
                    var result = jsonData.map(item => item.word);
                    return result;
                },
                cache: false
            });
    }

    function getDictionarySuggestions(term) {
        return $http.post('https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0',
            [{ Text: term }],
            {
                params: { from: language, to: 'en' },
                transformResponse: function(data) {
                    var jsonData = JSON.parse(data);
                    var translates = jsonData
                        .map(item => item.translations
                            .map(term => term.normalizedTarget+"| "+term.backTranslations.map(t => t.normalizedText).join('; ')));
                    var result = [];
                    translates.forEach(function(item){
                        result = result.concat(item);
                    })
                    return result;
                },
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Content-Type": "application/json"
                },
                cache: false
            });
    }

    function detectLanguage(word) {
        return $http.post('https://api.cognitive.microsofttranslator.com/detect?api-version=3.0',
            [{Text: word}],
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Content-Type": "application/json"
                },
                cache: false
            });
    }

    function translateSentence (sentence) {
        return $http.post('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0',
            [{Text: sentence}],
            {
                params: { from: 'en', to: language },
                transformResponse: function(data) {
                    var jsonData = JSON.parse(data);
                    var translations = jsonData
                        .map(item => item.translations.shift().text);
                    return translations;
                },
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Content-Type": "application/json"
                },
                cache: false
            });
    }

    return {
        getSuggestions: function (word) {
            if (lastWord != word) {
                lastWord = word;
                if (word.length > 2) {
                    return detectLanguage(word)
                        .then(d => {
                            if (d.data.length > 0 && d.data[0].language === language) {
                                return getDictionarySuggestions(word);
                            }
                            else {
                                return getDatamuseSuggestions(word);
                            }
                        });
                }
            }
            return null;
        },
        translateSentence: function(sentence){
            return translateSentence(sentence);
        }
    }
}])