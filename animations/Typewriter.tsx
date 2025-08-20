'use client';

import React from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';

// TYPE DEFINITIONS

type TypewriterItem = string | { key: string };

interface ParsedHtml {
    segments: Array<{
        type: 'text' | 'tag_open' | 'tag_close';
        content: string;
        isVisible: boolean;
    }>;
    plainText: string;
    totalLength: number;
}

interface HtmlSanitizer {
    sanitizeHtml: (html: string) => string;
    stripHtmlTags: (html: string) => string;
}

interface TypewriterProps {
    texts: TypewriterItem[];
    typeSpeed?: number;
    deleteSpeed?: number;
    delayBetween?: number;
    className?: string;
    cursor?: boolean;
    loop?: boolean;
    onComplete?: () => void;
    onTextChange?: (text: string, index: number) => void;
    onError?: (error: Error) => void;
    translateFn?: (key: string) => string;
    // HTML options
    enableHtml?: boolean;
    sanitizeHtml?: boolean;
    maxHtmlLength?: number;
    // Performance options
    maxCacheSize?: number;
    // NEW FEATURES
    newLineIterable?: boolean; // If true, adds new lines instead of deleting
    initialDelay?: number; // Delay after page load before starting (in seconds)
    iterableDelay?: number; // Delay between each iterable item when using newLineIterable (in seconds)
    // TEXT FORMATTING OPTIONS
    minLineLength?: number; // Minimum line length for consistent spacing (default: 0)
    paddingChar?: string; // Character to use for padding short lines (default: ' ')
    normalizeLines?: boolean; // Auto-normalize line lengths in newLineIterable mode (default: false)
}

// HTML SANITIZER IMPLEMENTATION

const createSanitizer = (): HtmlSanitizer => {
    const ALLOWED_TAGS = [
        'span',
        'div',
        'a',
        'i',
        'b',
        'strong',
        'em',
        'br',
        'code',
        'pre',
    ] as const;
    const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
        '*': ['style', 'class'],
        a: ['href', 'target', 'rel'],
        span: ['style', 'class'],
        div: ['style', 'class'],
    };

    const ALLOWED_TAILWIND_PATTERNS = [
        /^text-(gray|red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|rose|violet|fuchsia|sky)-(50|100|200|300|400|500|600|700|800|900)$/,
        /^bg-(gray|red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|rose|violet|fuchsia|sky)-(50|100|200|300|400|500|600|700|800|900)$/,
        /^font-(mono|sans|serif|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
        /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
        /^(italic|not-italic|underline|no-underline|line-through|overline)$/,
        /^p(l|r|t|b|x|y)?-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
        /^m(l|r|t|b|x|y)?-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
        /^(block|inline|inline-block|flex|grid|hidden)$/,
        /^hover:(text|bg)-(gray|red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|rose|violet|fuchsia|sky)-(50|100|200|300|400|500|600|700|800|900)$/,
        /^(cursor-pointer|cursor-default|cursor-not-allowed)$/,
        /^w-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|full)$/,
        /^h-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|full)$/,
        /^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/,
        /^border(-[tlrb])?(-gray|-red|-blue|-green|-yellow|-purple|-pink|-indigo|-orange|-teal|-cyan|-emerald|-lime|-amber|-rose|-violet|-fuchsia|-sky)-(50|100|200|300|400|500|600|700|800|900)$/,
        /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
    ];

    const ALLOWED_CSS_PROPERTIES = [
        'color',
        'background-color',
        'font-size',
        'font-weight',
        'font-style',
        'text-decoration',
        'padding',
        'padding-left',
        'padding-right',
        'padding-top',
        'padding-bottom',
        'margin',
        'margin-left',
        'margin-right',
        'margin-top',
        'margin-bottom',
        'display',
        'width',
        'height',
        'border',
        'border-radius',
        'line-height',
        'opacity',
        'visibility',
    ];

    const sanitizeStyles = (styleString: string): string => {
        try {
            if (!styleString || typeof styleString !== 'string') return '';

            const styles = styleString
                .split(';')
                .map((style) => style.trim())
                .filter((style) => style.length > 0)
                .filter((style) => {
                    const [prop] = style.split(':').map((s) => s.trim());
                    return ALLOWED_CSS_PROPERTIES.includes(prop.toLowerCase());
                })
                .filter((style) => {
                    const lowerStyle = style.toLowerCase();
                    return (
                        !lowerStyle.includes('javascript:') &&
                        !lowerStyle.includes('expression(') &&
                        !lowerStyle.includes('url(') &&
                        !lowerStyle.includes('@import') &&
                        !lowerStyle.includes('behavior:')
                    );
                });

            return styles.join('; ');
        } catch (error) {
            console.warn('Style sanitization failed:', error);
            return '';
        }
    };

    const sanitizeClasses = (classString: string): string => {
        try {
            if (!classString || typeof classString !== 'string') return '';

            const classes = classString
                .split(/\s+/)
                .filter((cls) => cls && cls.length > 0)
                .filter((cls) => {
                    // Allow specific safe classes or those matching Tailwind patterns
                    return (
                        ALLOWED_TAILWIND_PATTERNS.some((pattern) => pattern.test(cls)) ||
                        /^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(cls)
                    ); // Basic CSS class name pattern
                });

            return classes.join(' ');
        } catch (error) {
            console.warn('Class sanitization failed:', error);
            return '';
        }
    };

    const sanitizeHtml = (html: string): string => {
        try {
            if (!html || typeof html !== 'string') return '';

            const temp = document.createElement('div');
            temp.innerHTML = html;

            const sanitizeElement = (element: Element): void => {
                const tagName = element.tagName.toLowerCase();

                if (
                    !ALLOWED_TAGS.includes(
                        tagName as any // eslint-disable-line @typescript-eslint/no-explicit-any
                    )
                ) {
                    element.remove();
                    return;
                }

                const allowedAttrs = [
                    ...(ALLOWED_ATTRIBUTES['*'] || []),
                    ...(ALLOWED_ATTRIBUTES[tagName] || []),
                ];

                // Remove disallowed attributes
                Array.from(element.attributes).forEach((attr) => {
                    const attrName = attr.name.toLowerCase();

                    if (!allowedAttrs.includes(attrName)) {
                        element.removeAttribute(attr.name);
                        return;
                    }

                    // Sanitize specific attributes
                    if (attrName === 'style') {
                        const sanitizedStyle = sanitizeStyles(attr.value);
                        if (sanitizedStyle) {
                            element.setAttribute('style', sanitizedStyle);
                        } else {
                            element.removeAttribute('style');
                        }
                    } else if (attrName === 'class') {
                        const sanitizedClasses = sanitizeClasses(attr.value);
                        if (sanitizedClasses) {
                            element.setAttribute('class', sanitizedClasses);
                        } else {
                            element.removeAttribute('class');
                        }
                    } else if (attrName === 'href') {
                        const href = attr.value.toLowerCase();
                        if (
                            href.startsWith('javascript:') ||
                            href.startsWith('data:') ||
                            href.startsWith('vbscript:')
                        ) {
                            element.removeAttribute('href');
                        }
                    }
                });

                // Process children
                Array.from(element.children).forEach((child) => {
                    sanitizeElement(child);
                });
            };

            Array.from(temp.children).forEach((child) => {
                sanitizeElement(child);
            });

            return temp.innerHTML;
        } catch (error) {
            console.warn('HTML sanitization failed:', error);
            return stripHtmlTags(html);
        }
    };

    const stripHtmlTags = (html: string): string => {
        try {
            if (!html || typeof html !== 'string') return '';

            const temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent || temp.innerText || '';
        } catch (error) {
            console.warn('HTML stripping failed:', error);
            return html.replace(/<[^>]*>/g, '');
        }
    };

    return { sanitizeHtml, stripHtmlTags };
};

// HTML PARSER IMPLEMENTATION

class HtmlTypewriterParser {
    private cache = new Map<string, ParsedHtml>();
    private readonly maxCacheSize: number;

    constructor(maxCacheSize: number = 50) {
        this.maxCacheSize = maxCacheSize;
    }

    parseHtml(html: string): ParsedHtml {
        if (!html || typeof html !== 'string') {
            return {
                segments: [],
                plainText: '',
                totalLength: 0,
            };
        }

        if (this.cache.has(html)) {
            return this.cache.get(html)!;
        }

        try {
            const segments: ParsedHtml['segments'] = [];
            let plainText = '';

            const htmlRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g;
            let lastIndex = 0;
            let match: RegExpExecArray | null;

            while ((match = htmlRegex.exec(html)) !== null) {
                // Add text before tag
                if (match.index > lastIndex) {
                    const textContent = html.slice(lastIndex, match.index);
                    if (textContent) {
                        segments.push({
                            type: 'text',
                            content: textContent,
                            isVisible: true,
                        });
                        plainText += textContent;
                    }
                }

                // Add tag
                segments.push({
                    type: match[0].startsWith('</') ? 'tag_close' : 'tag_open',
                    content: match[0],
                    isVisible: false,
                });

                lastIndex = htmlRegex.lastIndex;
            }

            // Add remaining text
            if (lastIndex < html.length) {
                const textContent = html.slice(lastIndex);
                if (textContent) {
                    segments.push({
                        type: 'text',
                        content: textContent,
                        isVisible: true,
                    });
                    plainText += textContent;
                }
            }

            const parsed: ParsedHtml = {
                segments,
                plainText,
                totalLength: plainText.length,
            };

            // Cache management
            if (this.cache.size >= this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }
            this.cache.set(html, parsed);

            return parsed;
        } catch (error) {
            console.error('HTML parsing failed:', error);
            // Fallback to plain text
            const plainText = html.replace(/<[^>]*>/g, '');
            return {
                segments: [{ type: 'text', content: plainText, isVisible: true }],
                plainText,
                totalLength: plainText.length,
            };
        }
    }

    getHtmlUpToPosition(html: string, targetPosition: number): string {
        if (!html || typeof html !== 'string' || targetPosition <= 0) {
            return '';
        }

        const parsed = this.parseHtml(html);
        let currentPosition = 0;
        let result = '';

        for (const segment of parsed.segments) {
            if (segment.type === 'text' && segment.isVisible) {
                const remainingChars = targetPosition - currentPosition;
                if (remainingChars <= 0) break;

                if (segment.content.length <= remainingChars) {
                    result += segment.content;
                    currentPosition += segment.content.length;
                } else {
                    result += segment.content.slice(0, remainingChars);
                    currentPosition = targetPosition;
                    break;
                }
            } else {
                // Add non-visible tags (opening/closing tags)
                result += segment.content;
            }
        }

        return result;
    }

    clearCache(): void {
        this.cache.clear();
    }

    getCacheSize(): number {
        return this.cache.size;
    }
}

// MAIN TYPEWRITER COMPONENT

export function Typewriter({
    texts,
    typeSpeed = 0.1,
    deleteSpeed = 0.05,
    delayBetween = 1,
    className = '',
    cursor = false,
    loop = false,
    onComplete,
    onTextChange,
    onError,
    translateFn,
    enableHtml = false,
    sanitizeHtml = true,
    maxHtmlLength = 10000,
    maxCacheSize = 50,
    // NEW FEATURES
    newLineIterable = false,
    initialDelay = 0,
    iterableDelay = 0.5,
    // TEXT FORMATTING OPTIONS
    minLineLength = 0,
    paddingChar = ' ',
    normalizeLines = false,
}: TypewriterProps) {
    const [currentText, setCurrentText] = useState<string>('');
    const [currentHtml, setCurrentHtml] = useState<string>('');
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [allTexts, setAllTexts] = useState<string[]>([]); // Store all typed texts for newLineIterable

    const currentTextRef = useRef<string>('');
    const isMountedRef = useRef<boolean>(true);
    const indexRef = useRef<number>(0);
    const animationRef = useRef<gsap.core.Tween | null>(null);
    const allTextsRef = useRef<string[]>([]);

    // Initialize sanitizer and parser with useMemo for performance
    const sanitizer = useMemo<HtmlSanitizer>(() => createSanitizer(), []);
    const parser = useMemo<HtmlTypewriterParser>(
        () => new HtmlTypewriterParser(maxCacheSize),
        [maxCacheSize]
    );

    // Error handling wrapper
    const handleError = useCallback(
        (error: Error, context: string) => {
            console.error(`Typewriter error in ${context}:`, error);
            setHasError(true);
            onError?.(error);
        },
        [onError]
    );

    // Sync currentText with ref
    useEffect(() => {
        currentTextRef.current = currentText;
    }, [currentText]);

    // Sync allTexts with ref
    useEffect(() => {
        allTextsRef.current = allTexts;
    }, [allTexts]);

    // Input validation
    const validateInputs = useCallback((): boolean => {
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            handleError(new Error('texts array is empty or undefined'), 'validateInputs');
            return false;
        }

        if (typeof typeSpeed !== 'number' || typeSpeed <= 0) {
            handleError(new Error('typeSpeed must be a positive number'), 'validateInputs');
            return false;
        }

        if (typeof deleteSpeed !== 'number' || deleteSpeed <= 0) {
            handleError(new Error('deleteSpeed must be a positive number'), 'validateInputs');
            return false;
        }

        if (typeof delayBetween !== 'number' || delayBetween < 0) {
            handleError(new Error('delayBetween must be a non-negative number'), 'validateInputs');
            return false;
        }

        if (typeof maxHtmlLength !== 'number' || maxHtmlLength <= 0) {
            handleError(new Error('maxHtmlLength must be a positive number'), 'validateInputs');
            return false;
        }

        if (typeof initialDelay !== 'number' || initialDelay < 0) {
            handleError(new Error('initialDelay must be a non-negative number'), 'validateInputs');
            return false;
        }

        if (typeof iterableDelay !== 'number' || iterableDelay < 0) {
            handleError(new Error('iterableDelay must be a non-negative number'), 'validateInputs');
            return false;
        }

        if (typeof minLineLength !== 'number' || minLineLength < 0) {
            handleError(new Error('minLineLength must be a non-negative number'), 'validateInputs');
            return false;
        }

        if (typeof paddingChar !== 'string') {
            handleError(new Error('paddingChar must be a string'), 'validateInputs');
            return false;
        }

        return true;
    }, [
        texts,
        typeSpeed,
        deleteSpeed,
        delayBetween,
        maxHtmlLength,
        initialDelay,
        iterableDelay,
        minLineLength,
        paddingChar,
        handleError,
    ]);

    // Resolve text with error handling
    const resolveText = useCallback(
        (item: TypewriterItem): string => {
            try {
                if (typeof item === 'string') {
                    return item;
                }

                if (typeof item === 'object' && item !== null && 'key' in item) {
                    if (translateFn && typeof translateFn === 'function') {
                        const translated = translateFn(item.key);
                        return typeof translated === 'string' ? translated : item.key;
                    }
                    return item.key;
                }

                return String(item);
            } catch (error) {
                handleError(error as Error, 'resolveText');
                return typeof item === 'string' ? item : 'Error loading text';
            }
        },
        [translateFn, handleError]
    );

    // Normalize and format text for consistent display
    const normalizeText = useCallback(
        (text: string): string => {
            try {
                if (!newLineIterable || !normalizeLines) {
                    return text;
                }

                // Get plain text length (strip HTML if present)
                const plainText = enableHtml ? sanitizer.stripHtmlTags(text) : text;
                const textLength = plainText.length;

                // If text is shorter than minLineLength, pad it
                if (textLength < minLineLength) {
                    const paddingNeeded = minLineLength - textLength;
                    const padding = paddingChar.repeat(paddingNeeded);

                    if (enableHtml) {
                        // For HTML, add padding as span to preserve styling
                        return text + `<span style="opacity: 0;">${padding}</span>`;
                    } else {
                        // For plain text, just add padding
                        return text + padding;
                    }
                }

                return text;
            } catch (error) {
                handleError(error as Error, 'normalizeText');
                return text;
            }
        },
        [
            newLineIterable,
            normalizeLines,
            minLineLength,
            paddingChar,
            enableHtml,
            sanitizer,
            handleError,
        ]
    );
    // Process and validate HTML content
    const processHtmlContent = useCallback(
        (rawHtml: string): { html: string; plainText: string } => {
            try {
                if (!rawHtml || typeof rawHtml !== 'string') {
                    return { html: '', plainText: '' };
                }

                // Length validation
                if (rawHtml.length > maxHtmlLength) {
                    handleError(
                        new Error(
                            `HTML content exceeds maximum length of ${maxHtmlLength} characters`
                        ),
                        'processHtmlContent'
                    );
                    const truncated = rawHtml.slice(0, maxHtmlLength);
                    return processHtmlContent(truncated);
                }

                let processedHtml = rawHtml;

                // Sanitize if enabled
                if (sanitizeHtml) {
                    processedHtml = sanitizer.sanitizeHtml(rawHtml);
                }

                // Parse to get plain text
                const plainText = sanitizer.stripHtmlTags(processedHtml);

                return { html: processedHtml, plainText };
            } catch (error) {
                handleError(error as Error, 'processHtmlContent');
                const plainText = sanitizer.stripHtmlTags(rawHtml);
                return { html: plainText, plainText };
            }
        },
        [maxHtmlLength, sanitizeHtml, sanitizer, handleError]
    );

    // Kill animations with error handling
    const killAnimations = useCallback(() => {
        try {
            if (animationRef.current) {
                animationRef.current.kill();
                animationRef.current = null;
            }
            gsap.killTweensOf({});
        } catch (error) {
            handleError(error as Error, 'killAnimations');
        }
    }, [handleError]);

    // Type animation with proper error handling and newLineIterable support
    const type = useCallback(
        (text: string, onCompleteCallback: () => void, isNewLineMode: boolean = false) => {
            if (!isMountedRef.current) return;

            try {
                const { html, plainText } = enableHtml
                    ? processHtmlContent(text)
                    : { html: text, plainText: text };

                const totalLength = plainText.length;
                let i = 0;

                // Get the prefix for new line mode
                const getPrefix = () => {
                    if (!isNewLineMode) return '';
                    return allTextsRef.current.length > 0
                        ? allTextsRef.current.join('\n') + '\n'
                        : '';
                };

                const typeNext = () => {
                    if (!isMountedRef.current) return;

                    try {
                        const prefix = getPrefix();

                        if (enableHtml) {
                            const htmlSubstring = parser.getHtmlUpToPosition(html, i + 1);
                            const plainSubstring = plainText.slice(0, i + 1);
                            const fullText = prefix + plainSubstring;

                            setCurrentHtml(isNewLineMode ? prefix + htmlSubstring : htmlSubstring);
                            setCurrentText(fullText);
                            onTextChange?.(fullText, indexRef.current);
                        } else {
                            const newText = text.slice(0, i + 1);
                            const fullText = prefix + newText;
                            setCurrentText(fullText);
                            onTextChange?.(fullText, indexRef.current);
                        }

                        i++;

                        if (i <= totalLength) {
                            animationRef.current = gsap.delayedCall(typeSpeed, typeNext);
                        } else {
                            // In newLineIterable mode, add the completed text to allTexts
                            if (isNewLineMode) {
                                setAllTexts((prev) => [...prev, plainText]);
                            }

                            animationRef.current = gsap.delayedCall(
                                isNewLineMode ? iterableDelay : delayBetween,
                                onCompleteCallback
                            );
                        }
                    } catch (error) {
                        handleError(error as Error, 'typeNext');
                        onCompleteCallback();
                    }
                };

                typeNext();
            } catch (error) {
                handleError(error as Error, 'type');
                onCompleteCallback();
            }
        },
        [
            typeSpeed,
            delayBetween,
            iterableDelay,
            onTextChange,
            enableHtml,
            processHtmlContent,
            parser,
            handleError,
        ]
    );

    // Erase animation with error handling
    const erase = useCallback(
        (onCompleteCallback: () => void) => {
            if (!isMountedRef.current) return;

            try {
                const currentPlainText = enableHtml
                    ? sanitizer.stripHtmlTags(currentTextRef.current)
                    : currentTextRef.current;

                let i = currentPlainText.length;

                const eraseNext = () => {
                    if (!isMountedRef.current) return;

                    try {
                        if (enableHtml) {
                            const { html: originalHtml } = processHtmlContent(
                                currentTextRef.current
                            );
                            const htmlSubstring = parser.getHtmlUpToPosition(
                                originalHtml,
                                Math.max(0, i - 1)
                            );
                            const plainSubstring = currentPlainText.slice(0, Math.max(0, i - 1));

                            setCurrentHtml(htmlSubstring);
                            setCurrentText(plainSubstring);
                        } else {
                            const newText = currentTextRef.current.slice(0, Math.max(0, i - 1));
                            setCurrentText(newText);
                        }

                        i--;

                        if (i > 0) {
                            animationRef.current = gsap.delayedCall(deleteSpeed, eraseNext);
                        } else {
                            animationRef.current = gsap.delayedCall(0.1, onCompleteCallback);
                        }
                    } catch (error) {
                        handleError(error as Error, 'eraseNext');
                        onCompleteCallback();
                    }
                };

                eraseNext();
            } catch (error) {
                handleError(error as Error, 'erase');
                onCompleteCallback();
            }
        },
        [deleteSpeed, enableHtml, sanitizer, processHtmlContent, parser, handleError]
    );

    // Main animation loop with comprehensive error handling and newLineIterable support
    const startAnimation = useCallback(() => {
        if (!texts.length || !isMountedRef.current) return;

        if (!validateInputs()) {
            setIsAnimating(false);
            return;
        }

        try {
            setIsAnimating(true);
            setHasError(false);

            const runCycle = () => {
                if (!isMountedRef.current) return;

                try {
                    const item = texts[indexRef.current];
                    if (!item) {
                        handleError(
                            new Error(`Invalid text item at index ${indexRef.current}`),
                            'runCycle'
                        );
                        setIsAnimating(false);
                        return;
                    }

                    const displayText = resolveText(item);
                    const normalizedText = normalizeText(displayText);

                    type(
                        normalizedText,
                        () => {
                            if (!isMountedRef.current) return;

                            // Check if we've reached the end
                            const isLastItem = indexRef.current === texts.length - 1;

                            if (!loop && isLastItem) {
                                setIsAnimating(false);
                                onComplete?.();
                                return;
                            }

                            if (newLineIterable) {
                                // In newLineIterable mode, just move to next without erasing
                                indexRef.current = indexRef.current + 1;

                                // Continue if looping or not at the end
                                if (loop) {
                                    // Reset index if we've gone through all texts in loop mode
                                    if (indexRef.current >= texts.length) {
                                        indexRef.current = 0;
                                    }
                                    runCycle();
                                } else if (indexRef.current < texts.length) {
                                    runCycle();
                                } else {
                                    setIsAnimating(false);
                                    onComplete?.();
                                }
                            } else {
                                // Original behavior with erasing
                                erase(() => {
                                    if (!isMountedRef.current) return;

                                    indexRef.current = indexRef.current + 1;

                                    if (loop) {
                                        // Reset index if we've gone through all texts in loop mode
                                        if (indexRef.current >= texts.length) {
                                            indexRef.current = 0;
                                        }
                                        runCycle();
                                    } else if (indexRef.current < texts.length) {
                                        runCycle();
                                    } else {
                                        setIsAnimating(false);
                                        onComplete?.();
                                    }
                                });
                            }
                        },
                        newLineIterable
                    );
                } catch (error) {
                    handleError(error as Error, 'runCycle');
                    setIsAnimating(false);
                }
            };

            // Apply initial delay
            if (initialDelay > 0) {
                animationRef.current = gsap.delayedCall(initialDelay, runCycle);
            } else {
                runCycle();
            }
        } catch (error) {
            handleError(error as Error, 'startAnimation');
            setIsAnimating(false);
        }
    }, [
        texts,
        loop,
        newLineIterable,
        initialDelay,
        normalizeText,
        resolveText,
        type,
        erase,
        onComplete,
        handleError,
        validateInputs,
    ]);

    // Main effect for initialization and cleanup
    useEffect(() => {
        // Reset error state
        setHasError(false);

        // Reset state
        isMountedRef.current = true;
        indexRef.current = 0;
        setCurrentText('');
        setCurrentHtml('');
        setAllTexts([]);

        killAnimations();

        // Start animation with delay for proper initialization
        const initTimer = setTimeout(() => {
            if (isMountedRef.current) {
                startAnimation();
            }
        }, 50);

        return () => {
            clearTimeout(initTimer);
            isMountedRef.current = false;
            indexRef.current = 0;
            setIsAnimating(false);
            setAllTexts([]);
            killAnimations();
        };
    }, [
        texts,
        typeSpeed,
        deleteSpeed,
        delayBetween,
        loop,
        newLineIterable,
        initialDelay,
        iterableDelay,
        startAnimation,
        killAnimations,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            killAnimations();
            parser.clearCache();
        };
    }, [killAnimations, parser]);

    // Error fallback rendering
    if (hasError) {
        return (
            <span
                className={`${className} typewriter-error`}
                role="text"
                aria-live="polite"
                data-testid="typewriter-error"
            >
                {currentText || 'Typewriter error occurred'}
            </span>
        );
    }

    // Render HTML or plain text with proper cursor positioning for newLineIterable
    const cursorClass = cursor ? 'typewriter-cursor' : '';
    const finalClassName = `${className} ${cursorClass}`;

    if (enableHtml) {
        return (
            <span
                className={finalClassName}
                role="text"
                aria-live="polite"
                aria-label={loop ? 'Animated text loop' : 'Animated text sequence'}
                data-testid="typewriter"
                data-is-animating={isAnimating}
                data-newline-iterable={newLineIterable}
                dangerouslySetInnerHTML={{ __html: currentHtml }}
            />
        );
    }

    // For newLineIterable mode, we need to handle line breaks properly
    if (newLineIterable) {
        const lines = currentText.split('\n');
        return (
            <span
                className={finalClassName}
                role="text"
                aria-live="polite"
                aria-label={loop ? 'Animated text loop' : 'Animated text sequence'}
                data-testid="typewriter"
                data-is-animating={isAnimating}
                data-newline-iterable={newLineIterable}
                style={{ whiteSpace: 'pre-line' }}
            >
                {lines.map((line, index) => (
                    <React.Fragment key={`line-${index}`}>
                        {line}
                        {index < lines.length - 1 && <br />}

                        {/* fix this later */}
                        {index === lines.length - 1 && cursor && isAnimating}
                    </React.Fragment>
                ))}
            </span>
        );
    }

    return (
        <span
            className={finalClassName}
            role="text"
            aria-live="polite"
            aria-label={loop ? 'Animated text loop' : 'Animated text sequence'}
            data-testid="typewriter"
            data-is-animating={isAnimating}
            data-newline-iterable={newLineIterable}
        >
            {currentText}
        </span>
    );
}

export default Typewriter;
