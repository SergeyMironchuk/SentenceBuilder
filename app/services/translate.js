angular.module('translate', []);
angular.module('translate')
    .factory('translate', ['$http', function($http){
        var lastWord="";
        var key = "";
        var language = 'uk';

        function getDatamuseSuggestions(term) {
            return $.ajax({
                url: 'https://api.datamuse.com/sug',
                dataType: 'json',
                crossDomain: true,
                data: {
                    s: term
                },
                cache: false
            }).promise();
        }

        function getDictionarySuggestions(term) {
            return $http.post('https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0',
                [{ Text: term }],
                {
                    params: { from: language, to: 'en' },
                    transformResponse: function(data) {
                        var jsonData = angular.fromJson(data);
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
                        var jsonData = angular.fromJson(data);
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
            getSuggestions: function (word, lang, apiKey) {
                language = lang ? lang : language;
                key = apiKey ? apiKey : key;
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
            translateSentence: function(sentence, lang, apiKey){
                language = lang ? lang : language;
                key = apiKey ? apiKey : key;
                return translateSentence(sentence);
            }
        }
    }])