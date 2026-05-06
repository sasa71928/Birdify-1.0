const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src/screens');
const stylesDir = path.join(__dirname, 'src/styles');

const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(screensDir, file), 'utf8');
  
  // Find "const styles = StyleSheet.create({"
  const styleIndex = content.lastIndexOf('const styles = StyleSheet.create({');
  if (styleIndex !== -1) {
    const styleContentStr = content.substring(styleIndex);
    
    // Check if it ends properly
    if (!styleContentStr.trim().endsWith('});')) {
      console.log(`Skipping ${file}: couldn't confidently parse end of StyleSheet`);
      continue;
    }
    
    const screenName = file.replace('.tsx', '');
    const styleName = screenName.charAt(0).toLowerCase() + screenName.slice(1);
    
    const themeImports = [];
    if (styleContentStr.includes('Colors.')) themeImports.push('Colors');
    if (styleContentStr.includes('Typography.')) themeImports.push('Typography');
    if (styleContentStr.includes('Spacing.')) themeImports.push('Spacing');
    if (styleContentStr.includes('Radius.')) themeImports.push('Radius');
    if (styleContentStr.includes('Shadows.')) themeImports.push('Shadows');
    
    let themeImportStr = '';
    if (themeImports.length > 0) {
      themeImportStr = `import { ${themeImports.join(', ')} } from '../theme';\n`;
    }
    
    const rnImports = ['StyleSheet'];
    if (styleContentStr.includes('Dimensions.')) rnImports.push('Dimensions');
    if (styleContentStr.includes('Platform.')) rnImports.push('Platform');
    
    let exportedObj = styleContentStr.replace('const styles = StyleSheet.create(', 'export default StyleSheet.create(');
    
    const newStyleFile = `import { ${rnImports.join(', ')} } from 'react-native';\n${themeImportStr}\n${exportedObj}\n`;
    
    const styleFilePath = path.join(stylesDir, `${styleName}.styles.ts`);
    fs.writeFileSync(styleFilePath, newStyleFile);
    
    // Update original file
    let newContent = content.substring(0, styleIndex).trim();
    
    const importStr = `import styles from '../styles/${styleName}.styles';`;
    
    // Remove "StyleSheet" from 'react-native' import if it exists and isn't needed anymore
    // (We'll leave it to TS to warn if it's unused, but it's cleaner to remove it if possible)
    
    // Insert the new import below other imports
    const lastImportIndex = newContent.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = newContent.indexOf('\n', lastImportIndex);
      newContent = newContent.slice(0, endOfLastImport + 1) + importStr + '\n' + newContent.slice(endOfLastImport + 1);
    } else {
      newContent = importStr + '\n\n' + newContent;
    }
    
    fs.writeFileSync(path.join(screensDir, file), newContent + '\n');
    console.log(`Extracted styles for ${file} to ${styleName}.styles.ts`);
  }
}
