import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import {format as prettyFormat} from 'pretty-format'; // ES2015 modules


function App() {

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000); // Revert back after 2 seconds
  };
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  // Scroll to the bottom of chat when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Format message with markdown and code highlighting
  const formatMessage = (content) => {
    // Import pretty-format if you're using a module system
    // If using in a browser, make sure to include the script in your HTML
    // const prettyFormat = require('pretty-format'); // For Node.js
  
    // Store code blocks temporarily to prevent them from being escaped
    const codeBlocks = [];
    const storeCodeBlock = (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({
        language: lang || '',
        code: code.trim()
      });
      return placeholder;
    };
    
    // Store inline code temporarily
    const inlineCodes = [];
    const storeInlineCode = (match, code) => {
      const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
      inlineCodes.push(code);
      return placeholder;
    };
    
    // Store tables temporarily
    const tables = [];
    const storeTable = (match) => {
      const placeholder = `__TABLE_${tables.length}__`;
      tables.push(match);
      return placeholder;
    };
    
    // Store JSON blocks temporarily
    const jsonBlocks = [];
    const storeJsonBlock = (match, json) => {
      const placeholder = `__JSON_BLOCK_${jsonBlocks.length}__`;
      jsonBlocks.push(json.trim());
      return placeholder;
    };
    
    // Store blockquotes temporarily
    const blockquotes = [];
    const storeBlockquote = (match) => {
      const placeholder = `__BLOCKQUOTE_${blockquotes.length}__`;
      blockquotes.push(match);
      return placeholder;
    };
    
    // Store horizontal rules
    const horizontalRules = [];
    const storeHorizontalRule = (match) => {
      const placeholder = `__HR_${horizontalRules.length}__`;
      horizontalRules.push(match);
      return placeholder;
    };
    
    // Replace code blocks, inline code, tables, JSON blocks, and blockquotes with placeholders
    let processedContent = content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, storeCodeBlock)
      .replace(/`([^`]+)`/g, storeInlineCode)
      .replace(/```json\n([\s\S]*?)```/g, storeJsonBlock) // JSON blocks
      .replace(/(\|[^\n]+\|\r?\n)((?:\|[^\n]+\|\r?\n)+)/g, storeTable) // Tables
      .replace(/(\n>.*?(?:\n>.*?)*)/g, storeBlockquote) // Blockquotes
      .replace(/\n\s*([-*_])\s*\1\s*\1(\s*\n|$)/g, storeHorizontalRule); // Horizontal rules
    
    // Escape HTML in the remaining content
    const escapeHTML = (str) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    
    processedContent = escapeHTML(processedContent);
    
    // Apply Markdown formatting
    processedContent = processedContent
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/~~(.*?)~~/g, "<del>$1</del>") // Strikethrough
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // Links
      .replace(/### (.*?)\n/g, "<h3>$1</h3>") // H3
      .replace(/## (.*?)\n/g, "<h2>$1</h2>") // H2
      .replace(/# (.*?)\n/g, "<h1>$1</h1>") // H1
      .replace(/\n\n/g, "</p><p>") // Paragraphs
      .replace(/\n/g, "<br>"); // Line breaks
    
    // Restore code blocks with proper HTML and copy button
    codeBlocks.forEach((block, index) => {
      const placeholder = `__CODE_BLOCK_${index}__`;
      
      // Create a unique ID for the code block
      const codeBlockId = `code-block-${Date.now()}-${index}`;
      
      // Add syntax highlighting based on language
      const applyHighlighting = (code, language) => {
        // Define syntax highlighting color map for different code elements
        const syntaxColors = {
          keyword: '#C586C0', // Pink for keywords (if, else, function, etc)
          string: '#CE9178',  // Orange-brown for strings
          comment: '#6A9955', // Green for comments
          number: '#B5CEA8',  // Light green for numbers
          function: '#DCDCAA', // Yellow for function names
          property: '#9CDCFE', // Light blue for properties
          operator: '#D4D4D4', // Light gray for operators
          variable: '#9CDCFE', // Light blue for variables
          tag: '#569CD6',     // Blue for HTML/XML tags
          attribute: '#9CDCFE', // Light blue for HTML/XML attributes
          default: '#D4D4D4'  // Default text color
        };
        
        // Simple syntax highlighting for common languages
        if (language === 'javascript' || language === 'js') {
          return code
            // Keywords
            .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|super|extends|default|case|break|continue|switch|typeof|instanceof)\b/g, `<span style="color: ${syntaxColors.keyword}">$1</span>`)
            // Strings
            .replace(/(['"])(.*?)\1/g, `<span style="color: ${syntaxColors.string}">$1$2$1</span>`)
            // Comments
            .replace(/(\/\/.*)/g, `<span style="color: ${syntaxColors.comment}">$1</span>`)
            // Numbers
            .replace(/\b(\d+)\b/g, `<span style="color: ${syntaxColors.number}">$1</span>`)
            // Functions
            .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, `<span style="color: ${syntaxColors.function}">$1</span>(`)
            // JSX tags
            .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, `$1<span style="color: ${syntaxColors.tag}">$2</span>`)
            // Properties and methods
            .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, `.<span style="color: ${syntaxColors.property}">$1</span>`);
        } else if (language === 'html') {
          return code
            // Tags
            .replace(/(&lt;\/?)([\w-]+)/g, `$1<span style="color: ${syntaxColors.tag}">$2</span>`)
            // Attributes
            .replace(/\b([\w-]+)=["']/g, `<span style="color: ${syntaxColors.attribute}">$1</span>="`);
        } else if (language === 'css') {
          return code
            // Properties
            .replace(/([\w-]+):/g, `<span style="color: ${syntaxColors.property}">$1</span>:`)
            // Values
            .replace(/: *(.*?);/g, `: <span style="color: ${syntaxColors.variable}">$1</span>;`);
        } else if (language === 'python') {
          return code
            // Keywords
            .replace(/\b(def|class|import|from|as|return|if|elif|else|for|while|try|except|finally|with|in|is|not|and|or|True|False|None)\b/g, `<span style="color: ${syntaxColors.keyword}">$1</span>`)
            // Strings
            .replace(/(['"])(.*?)\1/g, `<span style="color: ${syntaxColors.string}">$1$2$1</span>`)
            // Comments
            .replace(/(#.*)/g, `<span style="color: ${syntaxColors.comment}">$1</span>`)
            // Numbers
            .replace(/\b(\d+)\b/g, `<span style="color: ${syntaxColors.number}">$1</span>`)
            // Functions
            .replace(/\b(def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, `<span style="color: ${syntaxColors.keyword}">$1</span> <span style="color: ${syntaxColors.function}">$2</span>`);
        }
        // Default - just return the code with basic escaping
        return code;
      };
      
      const escapedCode = escapeHTML(block.code);
      const highlightedCode = applyHighlighting(escapedCode, block.language.toLowerCase());
      
      // Style for code block with reduced line-height and improved text color
      const codeBlockStyle = `
        background-color: #1e1e1e; 
        color: #f8f8f8; 
        padding: 1em; 
        border-radius: 5px; 
        overflow-x: auto;
        max-width: 100%;
        box-sizing: border-box;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        line-height: 1.3;
        white-space: pre-wrap;
        word-break: break-word;
        position: relative;
      `;
      
      // Simple copy button in top-right corner with text for copied state
      const copyButtonHtml = `
        <div style="position: absolute; top: 5px; right: 5px;">
          <button id="${codeBlockId}-copy" onclick="copyCode${index}()" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            color: #d4d4d4;
          ">
            <span id="${codeBlockId}-copy-text" style="margin-right: 4px; display: none; font-size: 12px;">Copied</span>
            <svg id="${codeBlockId}-copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg id="${codeBlockId}-copied-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </button>
        </div>
      `;
      
      // Copy function that toggles between copy and check icons and shows "Copied" text
      const copyFunction = `
        function copyCode${index}() {
          const codeElement = document.getElementById('${codeBlockId}');
          const textToCopy = codeElement.textContent;
          navigator.clipboard.writeText(textToCopy)
            .then(() => {
              // Toggle icons and show "Copied" text
              document.getElementById('${codeBlockId}-copy-icon').style.display = 'none';
              document.getElementById('${codeBlockId}-copied-icon').style.display = 'inline';
              document.getElementById('${codeBlockId}-copy-text').style.display = 'inline';
              
              // Switch back to copy icon after 2 seconds
              setTimeout(() => {
                document.getElementById('${codeBlockId}-copy-icon').style.display = 'inline';
                document.getElementById('${codeBlockId}-copied-icon').style.display = 'none';
                document.getElementById('${codeBlockId}-copy-text').style.display = 'none';
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy code: ', err);
            });
        }
      `;
      
      // Complete HTML for code block with copy button - now with proper width constraints
      const html = `
        <div style="max-width: 100%; overflow-x: hidden; box-sizing: border-box; position: relative;">
          <pre style="${codeBlockStyle}">
            ${copyButtonHtml}
            <code id="${codeBlockId}" class="language-${block.language}">${highlightedCode}</code>
          </pre>
          <script>${copyFunction}</script>
        </div>
      `;
      
      processedContent = processedContent.replace(placeholder, html);
    });
    
    // Format and restore tables
    tables.forEach((table, index) => {
      const placeholder = `__TABLE_${index}__`;
      
      // Split table rows
      const rows = table.trim().split('\n');
      
      // Check for header separator row (contains only |, -, :, and spaces)
      const hasHeader = rows.length > 1 && /^\|[-:\|\s]+\|$/.test(rows[1]);
      
      // Parse alignment from separator row
      let alignments = [];
      if (hasHeader && rows[1]) {
        alignments = rows[1].split('|').filter(cell => cell.trim() !== '').map(cell => {
          if (cell.trim().startsWith(':') && cell.trim().endsWith(':')) return 'center';
          if (cell.trim().endsWith(':')) return 'right';
          return 'left';
        });
      }
      
      let tableHtml = `<div style="overflow-x: auto;"><table style="border-collapse: collapse; width: 100%; margin: 16px 0;">`;
      
      // Process rows
      rows.forEach((row, rowIndex) => {
        // Skip the separator row
        if (hasHeader && rowIndex === 1) return;
        
        const cells = row.split('|').filter(cell => cell !== '');
        
        if (cells.length > 0) {
          const isHeader = hasHeader && rowIndex === 0;
          tableHtml += '<tr>';
          
          cells.forEach((cell, cellIndex) => {
            const cellContent = escapeHTML(cell.trim());
            const cellTag = isHeader ? 'th' : 'td';
            const align = alignments[cellIndex] || 'left';
            
            tableHtml += `<${cellTag} style="padding: 8px; border: 1px solid #ddd; text-align: ${align};">${cellContent}</${cellTag}>`;
          });
          
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</table></div>';
      processedContent = processedContent.replace(placeholder, tableHtml);
    });
    
    // Format and restore JSON blocks using pretty-format
    jsonBlocks.forEach((jsonString, index) => {
      const placeholder = `__JSON_BLOCK_${index}__`;
      
      // Create a unique ID for the JSON block
      const jsonBlockId = `json-block-${Date.now()}-${index}`;
      
      try {
        // Try to parse the JSON
        const jsonObj = JSON.parse(jsonString);
        
        // Format using pretty-format if available, otherwise use JSON.stringify
        let formattedJson;
        if (typeof prettyFormat !== 'undefined') {
          // If pretty-format is available globally
          formattedJson = prettyFormat(jsonObj, {
            plugins: [
              prettyFormat.plugins.DOMElement,
              prettyFormat.plugins.DOMCollection,
            ],
            printFunctionName: true,
            highlight: true,
            indent: 2,
          });
        } else {
          // Fallback to JSON.stringify
          formattedJson = JSON.stringify(jsonObj, null, 2);
        }
        
        const escapedJson = escapeHTML(formattedJson);
        
        // Style for JSON formatter
        const jsonBlockStyle = `
          background-color: #f8f8f8;
          color: #333;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          max-width: 100%;
          box-sizing: border-box;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.3;
          white-space: pre-wrap;
          word-break: break-word;
          position: relative;
        `;
        
        // JSON syntax highlighting
        const highlightedJson = escapedJson
          .replace(/"(\\.|[^"\\])*"(?=\s*:)/g, '<span style="color: #a31515;">$&</span>') // Keys
          .replace(/: *(true|false|null)/g, ': <span style="color: #0000ff;">$1</span>') // Booleans and null
          .replace(/: *(".*?"|\'.*?\')/g, ': <span style="color: #a31515;">$1</span>') // Strings
          .replace(/: *(-?\d+\.?\d*)/g, ': <span style="color: #098658;">$1</span>') // Numbers
          .replace(/[{}\[\],]/g, '<span style="color: #000000;">$&</span>'); // Brackets and commas
        
        // Copy button for JSON block
        const copyButtonHtml = `
          <div style="position: absolute; top: 5px; right: 5px;">
            <button id="${jsonBlockId}-copy" onclick="copyJson${index}()" style="
              background: none;
              border: none;
              cursor: pointer;
              padding: 5px;
              display: flex;
              align-items: center;
              color: #333;
            ">
              <span id="${jsonBlockId}-copy-text" style="margin-right: 4px; display: none; font-size: 12px;">Copied</span>
              <svg id="${jsonBlockId}-copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg id="${jsonBlockId}-copied-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </button>
          </div>
        `;
        
        // Copy function for JSON block
        const copyFunction = `
          function copyJson${index}() {
            const jsonElement = document.getElementById('${jsonBlockId}');
            const textToCopy = ${typeof prettyFormat !== 'undefined' 
              ? `prettyFormat(${JSON.stringify(jsonObj)}, { indent: 2 })`
              : `JSON.stringify(${JSON.stringify(jsonObj)}, null, 2)`};
            navigator.clipboard.writeText(textToCopy)
              .then(() => {
                // Toggle icons and show "Copied" text
                document.getElementById('${jsonBlockId}-copy-icon').style.display = 'none';
                document.getElementById('${jsonBlockId}-copied-icon').style.display = 'inline';
                document.getElementById('${jsonBlockId}-copy-text').style.display = 'inline';
                
                // Switch back to copy icon after 2 seconds
                setTimeout(() => {
                  document.getElementById('${jsonBlockId}-copy-icon').style.display = 'inline';
                  document.getElementById('${jsonBlockId}-copied-icon').style.display = 'none';
                  document.getElementById('${jsonBlockId}-copy-text').style.display = 'none';
                }, 2000);
              })
              .catch(err => {
                console.error('Failed to copy JSON: ', err);
              });
          }
        `;
        
        // Complete HTML for JSON block
        const html = `
          <div style="max-width: 100%; overflow-x: hidden; box-sizing: border-box; position: relative;">
            <pre style="${jsonBlockStyle}">
              ${copyButtonHtml}
              <code id="${jsonBlockId}" class="language-json">${highlightedJson}</code>
            </pre>
            <script>${copyFunction}</script>
          </div>
        `;
        
        processedContent = processedContent.replace(placeholder, html);
      } catch (e) {
        // If JSON is invalid, just use the regular code block formatting
        const escapedJson = escapeHTML(jsonString);
        processedContent = processedContent.replace(placeholder, `<pre style="background-color: #f8f8f8; padding: 1em; border-radius: 5px; overflow-x: auto;"><code>${escapedJson}</code></pre>`);
      }
    });
    
    // Format and restore blockquotes
    blockquotes.forEach((quote, index) => {
      const placeholder = `__BLOCKQUOTE_${index}__`;
      
      // Remove the '>' prefix from each line
      const quotedText = quote.replace(/^>[ \t]*/gm, '').trim();
      
      // Format as HTML blockquote
      const blockquoteHtml = `
        <blockquote style="margin: 1em 0; padding-left: 1em; border-left: 4px solid #ddd; color: #666;">
          ${quotedText}
        </blockquote>
      `;
      
      processedContent = processedContent.replace(placeholder, blockquoteHtml);
    });
    
    // Format and restore horizontal rules
    horizontalRules.forEach((rule, index) => {
      const placeholder = `__HR_${index}__`;
      
      // Format as HTML horizontal rule
      const hrHtml = `<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #ddd;">`;
      
      processedContent = processedContent.replace(placeholder, hrHtml);
    });
    
    // Restore inline code with proper HTML
    inlineCodes.forEach((code, index) => {
      const placeholder = `__INLINE_CODE_${index}__`;
      const escapedCode = escapeHTML(code);
      const inlineCodeStyle = `
        background-color: #f0f0f0; 
        color: #333; 
        padding: 0.2em 0.4em; 
        border-radius: 3px; 
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
      `;
      processedContent = processedContent.replace(placeholder, `<code style="${inlineCodeStyle}">${escapedCode}</code>`);
    });
    
    // Add support for task lists / checkboxes
    processedContent = processedContent.replace(/- \[ \]/g, '<div style="display: flex; align-items: center; margin: 0.3em 0;"><input type="checkbox" disabled style="margin-right: 0.5em;"><span>');
    processedContent = processedContent.replace(/- \[x\]/g, '<div style="display: flex; align-items: center; margin: 0.3em 0;"><input type="checkbox" checked disabled style="margin-right: 0.5em;"><span>');
    
    // Close the task list items
    processedContent = processedContent.replace(/<\/p><p>/g, '</span></div></p><p>');
    processedContent = processedContent.replace(/<br>/g, '</span></div><br>');
    
    // Wrap the content in paragraph tags if it's not already
    if (!processedContent.trim().startsWith("<")) {
      processedContent = "<p>" + processedContent + "</p>";
    }
    
    return processedContent;
  };
  // Send message handler
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Hide welcome screen
    setShowWelcome(false);

    // Add user message
    const newMessages = [...messages, { sender: 'user', content: inputValue }];
    setMessages(newMessages);
    
    // Clear input
    setInputValue('');
    
    // Show loading state
    setIsLoading(true);
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "HTTP-Referer": "https://gv-gpt.vercel.app/", 
          "X-Title": "GVGPT", 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "google/gemma-2-9b-it:free",
          "messages": [
            {
              "role": "user",
              "content": inputValue
            }
          ]
        })
      });
      
      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      // Add assistant message
      setMessages([...newMessages, { sender: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      // Add error message
      setMessages([...newMessages, { sender: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chat button click
  const handleNewChat = () => {
    setMessages([]);
    setShowWelcome(true);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle Enter key in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      <div className="chat-header">
        <div className="logo">
          <i className="fas fa-robot"></i>
          GvGPT
        </div>
        <button className="new-chat-button" onClick={handleNewChat}>
          <i className="fas fa-plus"></i>
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="chat-area" ref={chatAreaRef}>
        {showWelcome && (
          <div className="welcome-screen">
            <h1 className="welcome-title">How can I help you today?</h1>
            <p className="welcome-subtitle">Welcome to <b>GV-GPT 🚀</b> – The Best ChatGPT Alternative, Ask me anything about code, design, or any other topic you're curious about.</p>
            
            
          </div>
          
        )}
        
        {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender}-message`}>
          <div className="message-inner">
            <div className={`avatar ${message.sender}-avatar`}>
              <i className={`fas fa-${message.sender === "user" ? "user" : "robot"}`}></i>
            </div>
            <div
              className="message-content"
              dangerouslySetInnerHTML={{
                __html: message.sender === "assistant" ? formatMessage(message.content) : message.content,
              }}
            />
          </div>
          {message.sender === "assistant" && (
            <div className="message-actions">
              <button
                className="message-action-button"
                title="Copy to clipboard"
                onClick={() => handleCopy(message.content, index)}
              >
                <i className={`fas ${copiedIndex === index ? "fa-check" : "fa-copy"}`}></i>
              </button>
              <button
                className="message-action-button"
                title="Like this response"
                onClick={(e) => {
                  e.currentTarget.innerHTML = '<i class="fas fa-thumbs-up"></i>';
                  e.currentTarget.style.color = "var(--accent-color)";
                }}
              >
                <i className="far fa-thumbs-up"></i>
              </button>
            </div>
          )}
        </div>
      ))}
        
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-inner">
              <div className="avatar assistant-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Message GvGPT..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send-button" onClick={sendMessage} title="Send message">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="input-footer">
          GvGPT can make mistakes. Consider checking important information.
        </div>
        <small><i>
          Design & Developed by <a style={{ textDecoration: 'none', color: 'white' }} target="_blank" rel="noreferrer" href="https://coderxgourav.github.io/gourav/">© Gourav</a>
        </i></small>
      </div>
    </div>
  );
}

export default App;