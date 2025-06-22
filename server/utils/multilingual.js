import { franc } from 'franc';
import translate from 'translate';

// Supported languages with their codes and names
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech'
};

// Default language
export const DEFAULT_LANGUAGE = 'en';

/**
 * Detect the language of the input text
 * @param {string} text - The text to detect language for
 * @returns {string} - Language code (e.g., 'en', 'es', 'fr')
 */
export const detectLanguage = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      return DEFAULT_LANGUAGE;
    }
    
    const detectedLang = franc(text);
    
    // Check if detected language is supported
    return SUPPORTED_LANGUAGES[detectedLang] ? detectedLang : DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Language detection error:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang = DEFAULT_LANGUAGE, sourceLang = null) => {
  try {
    if (!text || typeof text !== 'string') {
      return text;
    }
    
    // Don't translate if target language is the same as source
    if (sourceLang && sourceLang === targetLang) {
      return text;
    }
    
    // Don't translate if target language is English (default)
    if (targetLang === DEFAULT_LANGUAGE) {
      return text;
    }
    
    const translated = await translate(text, { 
      to: targetLang,
      from: sourceLang || 'auto'
    });
    
    return translated || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

/**
 * Get language name from code
 * @param {string} langCode - Language code
 * @returns {string} - Language name
 */
export const getLanguageName = (langCode) => {
  return SUPPORTED_LANGUAGES[langCode] || 'Unknown';
};

/**
 * Check if language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} - True if supported
 */
export const isLanguageSupported = (langCode) => {
  return !!SUPPORTED_LANGUAGES[langCode];
};

/**
 * Get all supported languages
 * @returns {Object} - Object with language codes as keys and names as values
 */
export const getSupportedLanguages = () => {
  return { ...SUPPORTED_LANGUAGES };
};

/**
 * Process multilingual query - detect language and translate if needed
 * @param {string} query - User query
 * @param {string} preferredLang - Preferred language for response
 * @returns {Promise<Object>} - Object with original query, detected language, and translated query
 */
export const processMultilingualQuery = async (query, preferredLang = DEFAULT_LANGUAGE) => {
  try {
    const detectedLang = detectLanguage(query);
    let translatedQuery = query;
    
    // Translate query to English for processing if it's not already in English
    if (detectedLang !== DEFAULT_LANGUAGE) {
      translatedQuery = await translateText(query, DEFAULT_LANGUAGE, detectedLang);
    }
    
    return {
      originalQuery: query,
      detectedLanguage: detectedLang,
      translatedQuery: translatedQuery,
      preferredLanguage: preferredLang
    };
  } catch (error) {
    console.error('Multilingual processing error:', error);
    return {
      originalQuery: query,
      detectedLanguage: DEFAULT_LANGUAGE,
      translatedQuery: query,
      preferredLanguage: preferredLang
    };
  }
};

/**
 * Translate agent response to user's preferred language
 * @param {string} response - Agent response in English
 * @param {string} targetLang - Target language for translation
 * @returns {Promise<string>} - Translated response
 */
export const translateAgentResponse = async (response, targetLang = DEFAULT_LANGUAGE) => {
  try {
    if (!response || typeof response !== 'string') {
      return response;
    }
    
    // Don't translate if target language is English
    if (targetLang === DEFAULT_LANGUAGE) {
      return response;
    }
    
    return await translateText(response, targetLang, DEFAULT_LANGUAGE);
  } catch (error) {
    console.error('Response translation error:', error);
    return response; // Return original response if translation fails
  }
}; 