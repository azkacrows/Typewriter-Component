# Typewriter Component

> At first I was bored and made a typewriter effect, but as time went on I wanted to add other features like internationalization and finally I wanted to be able to style the text in this component. This was built to continue learning TypeScript without any AI assistance except for building the documentation - this take 2 days and a lot of trial and error.

## ✅ Production-Ready Features

### **Security** (Built-in Protection)

-   **XSS Prevention**: HTML sanitization with allowlist approach
-   **Content Validation**: Whitelist for HTML tags, attributes, and CSS properties
-   **Tailwind Class Validation**: Regex patterns for safe CSS classes
-   **Input Sanitization**: Automatic cleanup of potentially dangerous content
-   **Length Limits**: Configurable content length restrictions

### **Performance** (Optimized)

-   **Memory Management**: Automatic cache cleanup with size limits
-   **Efficient Parsing**: Single-pass HTML parser
-   **GSAP Integration**: Hardware-accelerated animations
-   **Smart Processing**: Processes content as needed

### **Reliability** (Error Handling)

-   **Comprehensive Error Handling**: Try-catch blocks with graceful fallbacks
-   **Input Validation**: Validates props and content before processing
-   **Memory Leak Prevention**: Proper cleanup of timers, refs, and animations
-   **Mount State Protection**: Guards prevent state updates on unmounted components
-   **Fallback Mechanisms**: Degrades to plain text if HTML processing fails

### **Maintainability** (Developer-friendly)

-   **TypeScript**: Full type safety with comprehensive interfaces
-   **Error Callbacks**: Built-in error reporting capability
-   **Debugging Support**: Data attributes and console logging
-   **Clean Architecture**: Separated concerns (parsing, sanitization, animation)
-   **Documentation**: Comprehensive JSDoc comments

## 🏢 Production-Ready Checklist

| Feature             | Status | Notes                                    |
| ------------------- | ------ | ---------------------------------------- |
| **Security**        | ✅     | XSS prevention, content sanitization     |
| **Performance**     | ✅     | Caching, memory management, optimization |
| **Error Handling**  | ✅     | Comprehensive error recovery             |
| **Accessibility**   | ✅     | ARIA attributes, screen reader support   |
| **TypeScript**      | ✅     | Full type safety                         |
| **Testing Ready**   | ✅     | Data attributes for testing              |
| **Monitoring**      | ✅     | Error callbacks for tracking             |
| **Memory Safety**   | ✅     | Proper cleanup, no leaks                 |
| **Browser Support** | ✅     | Modern browsers with ES6+ support        |
| **Bundle Size**     | ✅     | Tree-shakeable, minimal dependencies     |

## 📊 Technical Implementation

```typescript
// Key features implemented:
// - Hardware-accelerated animations via GSAP
// - Comprehensive error handling and fallbacks
```

## 🚀 Deployment Recommendations

### **For High-Traffic Apps:**

```jsx
<Typewriter
    texts={content}
    enableHtml={true}
    maxCacheSize={100} // Increase cache for better performance
    maxHtmlLength={5000} // Adjust based on your content
    onError={(error) => {
        // Send to your error tracking service
        analytics.trackError('typewriter_error', error);
    }}
/>
```

### **For Security-Critical Apps:**

```jsx
<Typewriter
    texts={userContent}
    enableHtml={true}
    sanitizeHtml={true} // Always true for user content
    onError={handleSecurityError}
/>
```

### **For Performance-Critical Apps:**

```jsx
<Typewriter
    texts={staticContent}
    enableHtml={true}
    maxCacheSize={200} // Larger cache for repeated content
    typeSpeed={0.03} // Faster animation for better UX
/>
```

## ⚠️ Implementation Notes

### **Bundle Size:**

-   **Dependencies**: Requires GSAP (must install separately)
-   **Recommendation**: Tree-shake unused features if needed

### **Browser Support:**

-   **Modern browsers**: Full ES6+ support required
-   **Mobile**: Full support with touch considerations
-   **Legacy**: May need polyfills for Map/Set in older browsers

### **Content Limitations:**

-   **Max content length**: Configurable via `maxHtmlLength` prop
-   **HTML nesting**: Supports reasonable nesting levels
-   **Animation performance**: Depends on content complexity and browser

## 🔒 Security Features:

-   **XSS Prevention** through HTML sanitization
-   **Content filtering** with tag and attribute allowlists
-   **Safe CSS** through property and class validation
-   **Input validation** for all props and content
-   **Error boundaries** prevent crashes from malicious content

## Basic Usage Examples

## 1. Copy it then Import the Component

example:

```tsx
import { Typewriter } from '@/components/animations/Typewriter';
```

---

### 1.1 Simple Text Animation

```tsx
export default function BasicExample() {
    return (
        <h1 className="text-2xl text-center mt-20">
            I am a{' '}
            <Typewriter
                texts={['developer', 'designer', 'freelancer']}
                typeSpeed={0.06}
                deleteSpeed={0.03}
                delayBetween={1.2}
                className="text-blue-600 font-semibold"
                loop={true}
            />
        </h1>
    );
}
```

### 1.2 Single Text Without Loop

```tsx
export default function SingleTextExample() {
    return (
        <div className="text-center mt-20">
            <Typewriter
                texts={['Welcome to our website!']}
                typeSpeed={0.08}
                loop={false}
                cursor={false}
                className="text-3xl font-bold text-gray-800"
            />
        </div>
    );
}
```

---

## 2. HTML Styling Examples

### 2.1 Code Syntax Highlighting with HTML

```tsx
export default function CodeExample() {
    const codeTexts = [
        `<span class="text-green-400 italic">// 404 page not found.</span>`,
        `<div>
      <span class="text-purple-400 font-semibold">if</span>
      <span class="text-gray-300"> (</span>
      <span class="text-orange-400">!</span>
      <span class="text-blue-300 italic">found</span>
      <span class="text-gray-300">) {</span>
    </div>`,
        `<div>
      <span class="pl-4 text-purple-400 font-semibold">throw</span>
      <span class="text-gray-300"> (</span>
      <span class="text-yellow-300">"(╯°□°)╯︵ ┻━┻"</span>
      <span class="text-gray-300">);</span>
    </div>`,
        `<div class="text-gray-300">}</div>`,
        `<div class="text-green-400 italic">
      // <a href="/" class="text-blue-400 underline hover:text-blue-300">Go home!</a>
    </div>`,
    ];

    return (
        <div className="bg-gray-900 p-6 rounded-lg font-mono">
            <Typewriter
                texts={codeTexts}
                enableHtml={true}
                sanitizeHtml={true}
                typeSpeed={0.05}
                deleteSpeed={0.02}
                delayBetween={2}
                loop={true}
                className="text-base leading-relaxed"
            />
        </div>
    );
}
```

### 2.2 Rich Text with Mixed Styling

```tsx
export default function RichTextExample() {
    const richTexts = [
        `<span class="text-2xl font-bold text-blue-600">Hello!</span>`,
        `<div class="text-lg">
      I'm a <span class="font-semibold text-purple-600">Full Stack Developer</span>
    </div>`,
        `<div class="text-lg">
      I love <span class="italic text-green-600">React</span> and
      <span class="font-mono text-orange-600">TypeScript</span>
    </div>`,
    ];

    return (
        <div className="text-center mt-20">
            <Typewriter
                texts={richTexts}
                enableHtml={true}
                typeSpeed={0.07}
                delayBetween={3}
                loop={true}
            />
        </div>
    );
}
```

---

## 3. Internationalization Examples

### 3.1 Usage with next-intl Translations

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function WithTranslationsExample() {
    const t = useTranslations();

    return (
        <h1 className="text-2xl text-center mt-20">
            {t('home.intro')}{' '}
            <Typewriter
                texts={[
                    'developer',
                    { key: 'home.roles.designer' },
                    { key: 'home.roles.freelancer' },
                ]}
                translateFn={t}
                typeSpeed={0.06}
                deleteSpeed={0.03}
                delayBetween={1.2}
                className="text-blue-600 font-semibold"
                loop={true}
            />
        </h1>
    );
}
```

### 3.2 Custom Translation Function

```tsx
export default function CustomTranslationExample() {
    const translations = {
        'role.developer': 'Entwickler',
        'role.designer': 'Designer',
        'role.freelancer': 'Freiberufler',
    };

    const customTranslate = (key: string) => {
        return translations[key as keyof typeof translations] || key;
    };

    return (
        <h1 className="text-2xl text-center mt-20">
            Ich bin ein{' '}
            <Typewriter
                texts={[
                    { key: 'role.developer' },
                    { key: 'role.designer' },
                    { key: 'role.freelancer' },
                ]}
                translateFn={customTranslate}
                typeSpeed={0.08}
                deleteSpeed={0.04}
                delayBetween={1.5}
                className="text-green-600 font-bold"
                loop={true}
            />
        </h1>
    );
}
```

---

## 4. Advanced Features & Callbacks

### 4.1 Event Handling and State Management

```tsx
import { useState } from 'react';

export default function CallbackExample() {
    const [isComplete, setIsComplete] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');

    return (
        <div className="text-center mt-20">
            <h1 className="text-2xl mb-4">
                Welcome,{' '}
                <Typewriter
                    texts={['visitor', 'friend', 'developer']}
                    typeSpeed={0.1}
                    deleteSpeed={0.05}
                    delayBetween={2}
                    className="text-purple-600 font-semibold"
                    loop={false}
                    onComplete={() => {
                        setIsComplete(true);
                        console.log('Animation completed!');
                    }}
                    onTextChange={(text, index) => {
                        setCurrentText(text);
                        setCurrentIndex(index);
                    }}
                />
            </h1>

            <div className="text-sm text-gray-600 mt-4">
                <p>Current text: "{currentText}"</p>
                <p>Current index: {currentIndex}</p>
                {isComplete && (
                    <p className="text-green-600 font-semibold animate-fade-in">
                        ✓ Animation completed!
                    </p>
                )}
            </div>
        </div>
    );
}
```

### 4.2 Error Handling and Monitoring

```tsx
import { useState } from 'react';

export default function ErrorHandlingExample() {
    const [errors, setErrors] = useState<string[]>([]);
    const [isHealthy, setIsHealthy] = useState(true);

    const handleError = (error: Error) => {
        console.error('Typewriter error:', error);
        setErrors((prev) => [...prev, error.message]);
        setIsHealthy(false);
        // analytics.trackError('typewriter_error', error);
    };

    const problematicTexts = [
        'Normal text',
        { key: 'nonexistent.translation.key' },
        `<script>alert('xss')</script>Safe content after malicious attempt`,
        { key: 'another.missing.key' },
    ];

    return (
        <div className="text-center mt-20">
            <div className="mb-4">
                Status:{' '}
                <span className={`font-semibold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {isHealthy ? '✓ Healthy' : '⚠ Has Errors'}
                </span>
            </div>

            <Typewriter
                texts={problematicTexts}
                enableHtml={true}
                sanitizeHtml={true}
                translateFn={(key) => `Missing: ${key}`}
                loop={true}
                className="text-lg"
                onError={handleError}
            />

            {errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                    <h3 className="font-semibold text-red-800 mb-2">Errors:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

---

## 5. Performance & Security Examples

### 5.1 High-Performance Configuration

```tsx
export default function PerformanceExample() {
    const largeParagraphs = [
        'This is a substantial paragraph that demonstrates how the Typewriter component handles larger amounts of text efficiently through its caching system...',
        'Another piece of content that shows the optimization features in action with proper memory management...',
        'The component uses intelligent caching to improve performance for repeated content...',
    ];

    return (
        <div className="max-w-4xl mx-auto mt-20 p-6">
            <Typewriter
                texts={largeParagraphs}
                typeSpeed={0.02}
                deleteSpeed={0.01}
                delayBetween={3}
                loop={true}
                maxCacheSize={100}
                maxHtmlLength={5000}
                className="text-lg leading-relaxed text-gray-700"
            />
        </div>
    );
}
```

### 5.2 Secure HTML Content Handling

```tsx
export default function SecurityExample() {
    const potentiallyDangerousContent = [
        `<span class="text-blue-600">Safe content</span>`,
        `<script>alert('This will be removed')</script><span class="text-green-600">But this is safe</span>`,
        `<div class="text-purple-600">Styled content</div>`,
    ];

    return (
        <div className="text-center mt-20">
            <h2 className="text-xl font-semibold mb-4">Security Demonstration</h2>
            <p className="text-sm text-gray-600 mb-6">
                All potentially malicious content is automatically sanitized
            </p>

            <Typewriter
                texts={potentiallyDangerousContent}
                enableHtml={true}
                sanitizeHtml={true}
                typeSpeed={0.05}
                loop={true}
                className="text-lg"
                onError={(error) => {
                    console.warn('Security issue detected and handled:', error);
                }}
            />
        </div>
    );
}
```

---

## 6. Styling Variations

### 6.1 No Cursor Variation

```tsx
export default function NoCursorExample() {
    return (
        <div className="text-center mt-20">
            <h1 className="text-3xl font-light">
                <Typewriter
                    texts={['Clean text without blinking cursor']}
                    cursor={false}
                    loop={false}
                    typeSpeed={0.08}
                    className="text-gray-800"
                />
            </h1>
        </div>
    );
}
```

### 6.2 Required CSS Styles

Add these styles to your global CSS file:

```css
/* Cursor animation for typewriter effect */
.typewriter-cursor::after {
    content: '|';
    animation: typewriter-blink 1s steps(1) infinite;
    margin-left: 2px;
    color: currentColor;
}

@keyframes typewriter-blink {
    0%,
    50% {
        opacity: 1;
    }
    50.01%,
    100% {
        opacity: 0;
    }
}

/* Error state styling */
.typewriter-error {
    color: #ef4444; /* Red color for error state */
    font-style: italic;
    opacity: 0.8;
}

/* Optional: Custom cursor variations */
.custom-cursor::after {
    content: '█'; /* Block cursor */
    animation: typewriter-blink 1s steps(1) infinite;
    margin-left: 2px;
    color: currentColor;
}

.custom-cursor-underscore::after {
    content: '_'; /* Underscore cursor */
    animation: typewriter-blink 1s steps(1) infinite;
    color: currentColor;
}
```

```tsx
export default function CustomCursorExample() {
    return (
        <div className="text-center mt-20 space-y-4">
            {/* Block cursor */}
            <div>
                <Typewriter
                    texts={['Custom block cursor', 'Looks bold!', 'Try it out']}
                    cursor={false}
                    className="custom-cursor text-2xl font-semibold text-blue-600"
                    loop={true}
                />
            </div>

            {/* Underscore cursor */}
            <div>
                <Typewriter
                    texts={['Underscore cursor', 'Classic style', 'Retro vibes']}
                    cursor={false}
                    className="custom-cursor-underscore text-xl text-green-600"
                    loop={true}
                />
            </div>
        </div>
    );
}
```

### 6.3 Error State Styling

The component automatically applies the `typewriter-error` class when errors occur:

```tsx
export default function ErrorStateExample() {
    const [forceError, setForceError] = useState(false);

    // Example of component with error state
    const problematicTexts = forceError ? [null, undefined] : ['Normal text'];

    return (
        <div className="text-center mt-20">
            <button
                onClick={() => setForceError(!forceError)}
                className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                {forceError ? 'Fix Error' : 'Trigger Error'}
            </button>

            <div>
                <Typewriter
                    texts={problematicTexts as any}
                    typeSpeed={0.05}
                    className="text-lg"
                    onError={(error) => console.log('Error:', error.message)}
                />
            </div>
        </div>
    );
}
```

---

## 7. Installation & Setup

### 7.1 Dependencies

```bash
npm install gsap
# or
yarn add gsap
```

### 7.2 CSS Setup

Add the required CSS to your global stylesheet or component:

```css
/* Required: Add this to your global.css or equivalent */
.typewriter-cursor::after {
    content: '|';
    animation: typewriter-blink 1s steps(1) infinite;
    margin-left: 2px;
    color: currentColor;
}

@keyframes typewriter-blink {
    0%,
    50% {
        opacity: 1;
    }
    50.01%,
    100% {
        opacity: 0;
    }
}

.typewriter-error {
    color: #ef4444;
    font-style: italic;
    opacity: 0.8;
}
```

---

## 8. Complete Props Reference

```ts
interface TypewriterProps {
    texts: (string | { key: string })[];
    typeSpeed?: number; // Animation speed for typing (default: 0.1)
    deleteSpeed?: number; // Animation speed for deleting (default: 0.05)
    delayBetween?: number; // Delay between text changes (default: 1)
    loop?: boolean; // Whether to loop through texts (default: false)
    cursor?: boolean; // Show blinking cursor (default: false)
    className?: string; // CSS classes to apply
    enableHtml?: boolean; // Enable HTML content rendering (default: false)
    sanitizeHtml?: boolean; // Sanitize HTML content (default: true)
    maxHtmlLength?: number; // Maximum HTML content length (default: 10000)
    translateFn?: (key: string) => string; // Translation function for text keys
    onComplete?: () => void; // Callback when animation completes
    onTextChange?: (text: string, index: number) => void; // Callback on text change
    onError?: (error: Error) => void; // Error handling callback
    maxCacheSize?: number; // Maximum cache size for parsed HTML (default: 50)
}
```

---

## 9. Best Practices & Tips

✅ **DO:**

-   Use `enableHtml` only when you need HTML styling
-   Always keep `sanitizeHtml={true}` for user-generated content
-   Use faster `typeSpeed` (0.02-0.05) for better user experience
-   Implement `onError` callback for production monitoring
-   Use translation keys for internationalized applications
-   Test with various content sizes and complexity

❌ **DON'T:**

-   Disable HTML sanitization for untrusted content
-   Use very slow typeSpeed (>0.2) - users may lose interest
-   Put excessive content in a single text item
-   Forget error handling in production environments
-   Use overly complex nested HTML structures

🔧 **Performance Tips:**

-   Adjust `maxCacheSize` based on your content variety
-   Consider disabling loop for very long content
-   Monitor performance with `onError` callback
-   Use reasonable `maxHtmlLength` limits

🛡️ **Security Tips:**

-   Never disable `sanitizeHtml` for user-generated content
-   Validate that translation functions return safe content
-   Consider implementing Content Security Policy (CSP) headers
-   Monitor errors for potential security issues

**Bottom line**: This component is production-ready with robust error handling, security features, and performance optimizations. It's suitable for professional applications that need reliable animated text with HTML support.
