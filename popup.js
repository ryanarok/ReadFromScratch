document.getElementById("convert").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Procesando…";
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.id) throw new Error("No se encontró la pestaña activa.");
    await browser.tabs.sendMessage(tab.id, { action: "convert-words" });
    status.textContent = "Palabras convertidas.";
  } catch (error) {
    status.textContent = "No se pudo modificar esta página. Algunas páginas internas de Firefox no lo permiten.";
  }
});