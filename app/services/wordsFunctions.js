function replaceWordInSentence(sentence, newWord, position) {
    newWord = newWord.split('|').shift();
    let leftPart = sentence.substring(0, position);
    let rightPart = sentence.substring(position);
    let leftPartArray = leftPart.split(' ');
    let rightPartArray = rightPart.split(' ');
    leftPartArray.pop();
    rightPartArray.shift();
    let result = leftPartArray.join(' ')
        + ' '
        + newWord
        + ' '
        + rightPartArray.join(' ');

    return result.trim();
}

function getCurrentWordFromSentence(sentence, position){
    var leftPart = sentence.substring(0, position);
    var rightPart = sentence.substring(position);
    if (leftPart.split('').pop() === ' '){ // word1 |word2
        return rightPart.split(' ').shift();
    }
    if (rightPart.split('').shift() === ' '){ // word1| word2
        return leftPart.split(' ').pop();
    }
    // wo|rd
    return leftPart.split(' ').pop() + rightPart.split(' ').shift();
}
