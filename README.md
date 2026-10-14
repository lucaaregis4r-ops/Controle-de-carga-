# Dashboard Olympico

Plataforma unificada para monitoramento da equipe do Olympico Club. Centraliza o acompanhamento e conciliação de check-ins de atletas, presença na preparação física e registros interdepartamentais de fisioterapia e psicologia.

## Ambiente e Execução

O sistema foi desenhado primariamente para operar em ambiente Linux.
**Requisito Mínimo:** Node.js 18. (Recomendado: Node.js 22+).

Para iniciar o servidor localmente na porta disponível, com inicialização automática do navegador:
```bash
./ABRIR-DASHBOARD.sh
```
> *Alternativa padrão:* `npm start` inicia o servidor em modo silencioso (sem abrir janela do browser).

O Chromium/Google Chrome é necessário no sistema host se houver intenção de exportar PDFs do relatório. Um dispositivo conectado à mesma rede local pode acessar o dashboard utilizando o IP exibido no console do servidor.

## Scripts e Utilitários

O repositório fornece ferramentas para geração de relatórios e exportação.

- `./GERAR-KIT-RELATORIOS.sh` - Processa e renderiza os relatórios para todas categorias em `output/reports/`.
- `./PREPARAR-ENVIO-RELATORIOS.sh <pasta>` - Cria artefatos para controle de envio.
- `./CONFIGURAR-GOOGLE-DRIVE.sh <credencial.json>` - Gera token e autoriza a submissão no Drive.
- `./GERAR-KIT-E-ENVIAR-DRIVE.sh` - Pipeline unificado que gera os arquivos locais e sincroniza para a pasta designada.
- `./COMPILAR-EXECUTAVEL.sh` - Rotina de build que emite uma versão independente em `dist-linux/`.

## Arquitetura de Dados e Metodologia

O backend processa dados provindos de abas de planilhas integradas e consolida isso em APIs (como presença e demandas da fisioterapia).

**Monitoramento de Desgaste:** A métrica analítica ("Desgaste percebido") é formada pela composição de escores subjetivos, orientados pelo questionário do atleta (sono, fadiga, humor, dores), e **não** reflete o volume biométrico de treinamento da preparação física.

O modelo estatístico inclui parâmetros como **Z-Score** para apontar elevações fora do padrão histórico da equipe e o **ACWR Exponencial** para controle da relação aguda/crônica de intensidade percebida, alertando sobre risco de sobrecarga. A inclusão no quadro "Atenção" engloba regras heurísticas que cruzam estes percentis e sinalizações de limiares absolutos.

## Validação e Qualidade

O sistema garante confiabilidade através de suítes de testes unitários. Para validar e auditar as regras e conexões:

```bash
npm test
npm run sources:validate
```

Para referências de implementação e processos de deploy, verifique os guias localizados no diretório `/docs`.