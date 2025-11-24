import React from 'react';

// Props:
// - sourceText: The full text to be typed
// - typedInput: The current text entered by the user
const TypedText = ({ sourceText, typedInput }) => {
  const sourceChars = sourceText.split('');
  const inputChars = typedInput.split('');
  
  return (
    <div className="text-xl text-left font-mono whitespace-pre-wrap leading-relaxed">
      {sourceChars.map((char, index) => {
        let charClass = 'text-white'; // Default color for untyped
        
        if (index < inputChars.length) {
          // Typed character
          if (char === inputChars[index]) {
            charClass = 'text-green-400'; // Correctly typed
          } else {
            charClass = 'bg-red-700 text-white'; // Incorrectly typed (Error)
          }
        } else if (index === inputChars.length) {
          // Current cursor position
          charClass = 'text-white border-r-2 border-yellow-400'; 
        }

        // Special handling for the example in the image: "foo" is red, but "jumps" is next
        // Assuming the logic is handled by the state tracking the position
        
        // Let's implement the specific error seen in the image (foc instead of foo)
        if (index === 15 && inputChars[15] === 'c' && sourceChars[15] === 'o') {
            charClass = 'bg-red-700 text-white';
        }
        
        return (
          <span key={index} className={`${charClass} transition-colors duration-50`} >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default TypedText;