import { useEffect, useRef } from 'react';
import type { Route } from './+types/test';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SAP DPA Adapter API Documentation" },
    { name: "description", content: "API documentation for the SAP Digital Payments Adapter" },
  ];
}

export default function ApiDocs() {
  const swaggerUiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Swagger UI scripts and styles
    const loadSwaggerUI = async () => {
      // Add CSS
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.type = 'text/css';
      linkEl.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
      document.head.appendChild(linkEl);

      // Load scripts
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      };

      // Load the required scripts
      await loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js');
      await loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js');

      // Initialize Swagger UI
      if (swaggerUiRef.current) {
        // Use a type assertion to access the dynamically loaded Swagger UI
        const SwaggerUIBundle = (window as any).SwaggerUIBundle;
        const SwaggerUIStandalonePreset = (window as any).SwaggerUIStandalonePreset;
        
        if (SwaggerUIBundle) {
          SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
            tagsSorter: "alpha",
            operationsSorter: "alpha"
          });
        }
      }
    };

    loadSwaggerUI();

    // Cleanup function
    return () => {
      // Remove any added scripts and styles when component unmounts
      const swaggerStyles = document.querySelector('link[href*="swagger-ui"]');
      if (swaggerStyles) swaggerStyles.remove();
      
      const scripts = document.querySelectorAll('script[src*="swagger-ui"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">SAP DPA Adapter API Documentation</h1>
        <p className="text-sm">Explore and test the available API endpoints</p>
      </div>
      <div className="flex-1 overflow-auto">
        <div id="swagger-ui" ref={swaggerUiRef}></div>
      </div>
    </div>
  );
}
