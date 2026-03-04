import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector<HTMLFormElement>('#uploadForm');
  const apiUrlInput = document.querySelector<HTMLInputElement>('#apiUrl');
  const filenameInput = document.querySelector<HTMLInputElement>('#filename');
  const contentInput = document.querySelector<HTMLTextAreaElement>('#content');
  const resultContainer = document.querySelector<HTMLDivElement>('#resultContainer');
  const jsonViewer = document.querySelector<HTMLPreElement>('#jsonViewer');
  const httpStatusBadge = document.querySelector<HTMLSpanElement>('#httpStatusBadge');
  const statusIndicator = document.querySelector<HTMLSpanElement>('#statusIndicator');
  const btnText = document.querySelector<HTMLSpanElement>('#btnText');
  const btnIcon = document.querySelector<SVGElement>('#btnIcon');
  const submitBtn = document.querySelector<HTMLButtonElement>('#submitBtn');

  // Load last used Api URL to help development speed
  const savedUrl = localStorage.getItem('localstack_api_url');
  if (savedUrl && apiUrlInput) apiUrlInput.value = savedUrl;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!apiUrlInput || !filenameInput || !contentInput || !jsonViewer || !httpStatusBadge || !statusIndicator || !resultContainer || !btnText || !btnIcon || !submitBtn) return;

    // Reset UI State
    btnText.textContent = 'Enviando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70');
    resultContainer.classList.remove('hidden');
    
    // Smooth transition trick
    setTimeout(() => resultContainer.classList.remove('opacity-0'), 50);
    
    jsonViewer.textContent = "Aguardando resposta do LocalStack...\nBuscando servidor API Gateway...";
    statusIndicator.className = "flex w-3 h-3 rounded-full bg-yellow-400 animate-pulse";
    httpStatusBadge.textContent = "WAITING";

    const fetchUrl = apiUrlInput.value.trim();
    localStorage.setItem('localstack_api_url', fetchUrl); // Save for next time

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filenameInput.value,
          content: contentInput.value
        })
      });

      const data = await response.json();
      
      // Update UI with response
      jsonViewer.textContent = JSON.stringify(data, null, 2);
      httpStatusBadge.textContent = `${response.status} ${response.statusText}`;

      if (response.ok) {
        statusIndicator.className = "flex w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]";
      } else {
        statusIndicator.className = "flex w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]";
      }
    } catch (error: any) {
      jsonViewer.textContent = "Erro de Conexão ou CORS! \n\n" + 
        "A requisição não chegou na AWS e falhou no navegador.\n\n" +
        "Detalhes: " + error.message;
      httpStatusBadge.textContent = "NETWORK ERROR";
      statusIndicator.className = "flex w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]";
    } finally {
      // Restore Button
      btnText.textContent = 'Fazer Upload pra Nuvem Falsa';
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
    }
  });
});
