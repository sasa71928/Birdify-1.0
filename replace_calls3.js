const fs = require('fs');
const path = 'c:/Birdify-1.0/BirdifyApp/src/screens/social/ChatScreen.tsx';

let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

// Find first call
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '// Marcar como leído hasta el último mensaje') {
    console.log('Found first call at line', i+1);
    console.log('Next lines:', lines.slice(i, i+8));
    // Replace lines i to i+6
    lines[i] = '    // Marcar como leído hasta el último mensaje';
    lines[i+1] = '    if (isNearBottomRef.current) {';
    lines[i+2] = '      markConversationAsRead();';
    lines[i+3] = '    }';
    // Remove old lines i+4 to i+6
    lines.splice(i+4, 4);
    break;
  }
}

// Find second call
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '// Marcar mensajes como leídos al abrir el chat si hay mensajes no leídos') {
    console.log('Found second call at line', i+1);
    console.log('Next lines:', lines.slice(i, i+10));
    // Find the line with "const lastMessage"
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('const lastMessage = messages[messages.length - 1]')) {
        console.log('Found lastMessage at line', j+1);
        lines[j] = '    markConversationAsRead();';
        // Remove next 5 lines
        lines.splice(j+1, 5);
        break;
      }
    }
    break;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
