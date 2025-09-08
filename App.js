import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [urls, setUrls] = useState([{ long: '', short: '', expiry: '' }]);
  const [usedCodes, setUsedCodes] = useState(new Set());

  useEffect(() => {
    const codes = JSON.parse(localStorage.getItem('usedCodes') || '[]');
    setUsedCodes(new Set(codes));
  }, []);

  // Function to generate a unique random alphanumeric string of length 6
  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result;
    do {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (usedCodes.has(result));
    setUsedCodes(prev => {
      const newSet = new Set(prev);
      newSet.add(result);
      localStorage.setItem('usedCodes', JSON.stringify([...newSet]));
      return newSet;
    });
    return result;
  };

  const getCreationDate = () => {
    return new Date().toLocaleDateString();
  };

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { long: '', short: '', expiry: '' }]);
    }
  };

  const removeUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index].long = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validUrls = urls.filter(url => url.long.trim() !== '');
    if (validUrls.length === 0) {
      alert('Please enter at least one URL to shorten.');
      return;
    }
    // Process concurrently
    const promises = validUrls.map(async (url, index) => {
      const shortCode = generateShortCode();
      const shortened = `${window.location.origin}/${shortCode}`;
      const creation = getCreationDate();
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      return { ...url, short: shortened, creation, expiry };
    });
    const results = await Promise.all(promises);
    setUrls(results.concat(urls.slice(validUrls.length)));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <form onSubmit={handleSubmit}>
          {urls.map((url, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="url"
                placeholder="Enter URL to shorten"
                value={url.long}
                onChange={(e) => updateUrl(index, e.target.value)}
                style={{ width: '300px', padding: '8px', fontSize: '16px' }}
              />
              {urls.length > 1 && (
                <button type="button" onClick={() => removeUrl(index)} style={{ marginLeft: '10px', padding: '8px 16px', fontSize: '16px' }}>
                  Remove
                </button>
              )}
              {url.short && (
                <div style={{ marginTop: '5px' }}>
                  <p>Shortened: <a href={url.short} target="_blank" rel="noopener noreferrer">{url.short}</a></p>
                  <p>Created on: {url.creation}</p>
                  <p>Expires on: {url.expiry}</p>
                </div>
              )}
            </div>
          ))}
          {urls.length < 5 && (
            <button type="button" onClick={addUrl} style={{ marginTop: '10px', padding: '8px 16px', fontSize: '16px' }}>
              Add Another URL
            </button>
          )}
          <button type="submit" style={{ marginTop: '20px', padding: '8px 16px', fontSize: '16px' }}>
            Shorten All
          </button>
        </form>
      </header>
    </div>
  );
}
