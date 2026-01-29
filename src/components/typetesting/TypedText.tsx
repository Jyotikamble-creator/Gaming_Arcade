// TypedText component for displaying text with typing feedback
import React from 'react';
import { TypedTextProps } from '../../types/typingTest';
import { getCharacterStyle } from '../../utils/typingTestUtils';

export default function TypedText({ sourceText, typedInput }: TypedTextProps): JSX.Element {
  const sourceChars = sourceText.split('');
  const inputChars = typedInput.split('');

  return (
    <div className="text-xl text-left font-mono whitespace-pre-wrap leading-relaxed">
      {sourceChars.map((char, index) => {
        const isCorrect = index < inputChars.length && char === inputChars[index];
        const className = getCharacterStyle(index, inputChars.length, isCorrect);

        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </div>
  );
}