// Simple Markdown parser utility with image support
export const parseMarkdown = (text: string, images?: Array<{
  id: number;
  filename: string;
  original_name: string;
  path: string;
}>): string => {
  if (!text) return '';

 
  if (process.env.NODE_ENV === 'development' && images) {
  }

  let html = text;
  const imageTokens: { [key: string]: string } = {};

 
  if (images && images.length > 0) {
    const allPlaceholders = text.match(/\{\{image:[^}]+\}\}/gim) || [];
    html = html.replace(/\{\{image:([^}]+)\}\}/gim, (match, imageId) => {
      let image = images.find(img => img.id === parseInt(imageId));
      
      if (!image && isNaN(parseInt(imageId))) {
        image = images.find(img => 
          img.filename === imageId || 
          img.filename.includes(imageId) ||
          img.original_name === imageId ||
          img.original_name.includes(imageId)
        );
      }
      
     
      if (!image) {
        const searchName = imageId.replace(/\.[^.]*$/, '');
        image = images.find(img => 
          img.original_name.toLowerCase().includes(searchName.toLowerCase()) ||
          img.filename.toLowerCase().includes(searchName.toLowerCase())
        );
      }
      
     
      if (!image) {
        const currentIndex = allPlaceholders.findIndex(p => p === match);
        if (currentIndex >= 0 && currentIndex < images.length) {
          image = images[currentIndex];
        }
      }
      
      if (image) {
        const token = `__IMAGE_TOKEN_${imageId.replace(/[^a-zA-Z0-9]/g, '_')}__`;
        imageTokens[token] = `<div class="my-6 text-center"><img src="http://127.0.0.1:3000${image.path}" alt="${image.original_name}" class="w-full max-w-full mx-auto rounded-lg shadow-lg border border-gray-200 transition-transform hover:scale-105" loading="lazy" /><p class="image-caption text-sm text-gray-500 text-center mt-2 italic">${image.original_name}</p></div>`;
        return token;
      }
      
      return `<div class="my-4 p-4 bg-gray-100 border-l-4 border-orange-400 text-orange-700 rounded"><p class="text-sm"><strong>⚠️ Image not found:</strong> ${imageId}</p><p class="text-xs mt-1">Available images: ${images.map(img => `${img.id} (${img.original_name})`).join(', ')}</p><p class="text-xs mt-1 text-blue-600">💡 Try using: ${images.map(img => `{{image:${img.id}}}`).join(' or ')}</p></div>`;
    });

   
    html = html.replace(/\{\{img:([^}]+)\}\}/gim, (match, filename) => {
      const image = images.find(img => 
        img.filename === filename || 
        img.original_name === filename ||
        img.filename.includes(filename)
      );
      if (image) {
        const token = `__IMAGE_TOKEN_${filename.replace(/[^a-zA-Z0-9]/g, '_')}__`;
        imageTokens[token] = `<div class="my-6 text-center"><img src="http://127.0.0.1:3000${image.path}" alt="${image.original_name}" class="w-full max-w-full mx-auto rounded-lg shadow-lg border border-gray-200 transition-transform hover:scale-105" loading="lazy" /><p class="image-caption text-sm text-gray-500 text-center mt-2 italic">${image.original_name}</p></div>`;
        return token;
      }
      return match;
    });

   
    html = html.replace(/\{\{image\}\}/gim, () => {
      if (images[0]) {
        const image = images[0];
        const token = `__IMAGE_TOKEN_FIRST__`;
        imageTokens[token] = `<div class="my-6 text-center"><img src="http://127.0.0.1:3000${image.path}" alt="${image.original_name}" class="w-full max-w-full mx-auto rounded-lg shadow-lg border border-gray-200 transition-transform hover:scale-105" loading="lazy" /><p class="image-caption text-sm text-gray-500 text-center mt-2 italic">${image.original_name}</p></div>`;
        return token;
      }
      return '';
    });
  }

 
  html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code>$1</code></pre>');

 
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-10 mb-6">$1</h1>');

 
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>');

 
  html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-gray-800">$1</em>');

 
  html = html.replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">$1</code>');

 
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

 
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">• $1</li>');
  html = html.replace(/(<li.*<\/li>)/gim, '<ul class="my-4">$1</ul>');

 
  html = html.replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed">');
  html = html.replace(/\n/gim, '<br />');

 
  if (!html.startsWith('<h') && !html.startsWith('<div') && !html.startsWith('<ul') && !html.startsWith('<pre') && !html.startsWith('__IMAGE_TOKEN_')) {
    html = `<p class="mb-4 text-gray-700 leading-relaxed">${html}</p>`;
  }

 
  Object.keys(imageTokens).forEach(token => {
    html = html.replace(new RegExp(token, 'g'), imageTokens[token]);
  });

  return html;
};

// Component for rendering markdown content with images
interface MarkdownRendererProps {
  content: string;
  className?: string;
  images?: Array<{
    id: number;
    filename: string;
    original_name: string;
    path: string;
  }>;
}

export const MarkdownRenderer = ({ content, className = '', images }: MarkdownRendererProps) => {
  const parsedHTML = parseMarkdown(content, images);
  
  return (
    <div 
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedHTML }}
    />
  );
};

export default MarkdownRenderer;
