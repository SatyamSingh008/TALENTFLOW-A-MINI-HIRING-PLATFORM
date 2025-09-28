import React, { useState, useRef, useEffect } from 'react';

const MentionsTextarea = ({ value, onChange, placeholder, suggestions = [] }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[suggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestionIndex, filteredSuggestions]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const mentionQuery = mentionMatch[1].toLowerCase();
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(mentionQuery)
      );
      
      setFilteredSuggestions(filtered);
      setMentionStart(cursorPos - mentionMatch[0].length);
      setShowSuggestions(filtered.length > 0);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
    
    onChange(e);
  };

  const selectSuggestion = (suggestion) => {
    if (!suggestion) return;
    
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current.selectionStart);
    const newValue = `${beforeMention}@${suggestion} ${afterMention}`;
    
    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current.focus();
      const newCursorPos = beforeMention.length + suggestion.length + 2;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getSuggestionsPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    
    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
      top: rect.bottom + scrollTop + 5,
      left: rect.left
    };
  };

  const position = getSuggestionsPosition();

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={4}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
          style={{
            top: position.top,
            left: position.left,
            minWidth: '200px'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === suggestionIndex ? 'bg-indigo-100 text-indigo-800' : ''
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              @{suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionsTextarea;
