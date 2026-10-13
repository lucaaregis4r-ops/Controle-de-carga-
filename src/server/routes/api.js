// src/server/routes/api.js

function createRouter(handlers) {
  const {
    fetchAthletesData,
    handlePhysiotherapyApi,
    handleAttendanceApi,
    handleExportPdf,
    handleExportWeeklyKit,
    handlePrintReport,
    resolveStaticFilePath,
    serveFile
  } = handlers;

  return async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (requestUrl.pathname === "/api/athletes") {
      try {
        const payload = await fetchAthletesData();
        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify(payload));
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
        });
        response.end(
          JSON.stringify({
            message: "Nao foi possivel carregar os atletas agora.",
            details: error.message,
          })
        );
      }
      return;
    }

    if (requestUrl.pathname === "/api/physiotherapy") {
      try {
        await handlePhysiotherapyApi(requestUrl, response);
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(
          JSON.stringify({
            message: "Nao foi possivel carregar a fisioterapia agora.",
            details: error.message,
          })
        );
      }
      return;
    }

    if (requestUrl.pathname === "/api/attendance") {
      try {
        await handleAttendanceApi(requestUrl, response);
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(
          JSON.stringify({
            message: "Nao foi possivel carregar a presenca da preparacao fisica agora.",
            details: error.message,
          })
        );
      }
      return;
    }

    if (requestUrl.pathname === "/api/export-pdf") {
      try {
        await handleExportPdf(requestUrl, response);
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(
          JSON.stringify({
            message: "Nao foi possivel exportar este PDF agora.",
            details: error.message,
          })
        );
      }
      return;
    }

    if (requestUrl.pathname === "/api/export-weekly-kit") {
      try {
        await handleExportWeeklyKit(response);
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(
          JSON.stringify({
            message: "Nao foi possivel gerar o kit semanal agora.",
            details: error.message,
          })
        );
      }
      return;
    }

    if (requestUrl.pathname === "/print-report") {
      try {
        await handlePrintReport(requestUrl, response);
      } catch (error) {
        response.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(error.message || "Nao foi possivel montar o relatório para impressao.");
      }
      return;
    }

    const filePath = resolveStaticFilePath(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Caminho invalido.");
      return;
    }

    try {
      await serveFile(filePath, response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Arquivo nao encontrado.");
    }
  };
}

module.exports = { createRouter };
