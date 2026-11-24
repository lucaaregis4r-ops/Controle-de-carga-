# Dashboard Olympico — controle de carga

Painel do Olympico Club para acompanhar check-ins de bem-estar, preparação física e registros de fisioterapia e psicologia.

## Executar

Requer Node.js 18 ou superior; Node.js 22 é recomendado. No Linux, inicie o painel com:

```bash
./ABRIR-DASHBOARD.sh
```

Como alternativa, rode `npm start`; esse comando não abre o navegador automaticamente.

Para gerar relatórios em PDF, o projeto usa Chromium ou Google Chrome em modo headless. Outros dispositivos na mesma rede Wi-Fi podem abrir o endereço exibido no terminal e instalar o painel como PWA.

## Scripts

- `./GERAR-KIT-RELATORIOS.sh`: gera relatórios das 16 categorias em `output/reports/`.
- `./PREPARAR-ENVIO-RELATORIOS.sh <pasta>`: organiza os arquivos e o controle de envio às comissões.
- `./CONFIGURAR-GOOGLE-DRIVE.sh <credencial.json>`: configura a autorização OAuth do Google Drive.
- `./GERAR-KIT-E-ENVIAR-DRIVE.sh`: gera os kits e sincroniza com uma pasta privada do Drive.
- `./COMPILAR-EXECUTAVEL.sh`: empacota o app em `dist-linux/`.

## Métricas

O painel reúne:

1. **Questionário de bem-estar (PSR/PSE):** fadiga, sono, dores musculares, estresse, humor e dor específica, com escala de 0 a 10.
2. **Índice Hooper (Hooper & Mackinnon, 1995):** soma dos quatro indicadores de fadiga, sono, dor muscular e estresse. A escala vai de 4 a 20; a média vai de 1 a 5.
3. **ACWR e EWMA (Williams et al., 2017):** comparam a carga recente, em uma janela aproximada de 7 dias, à tolerância crônica, em aproximadamente 28 dias. As faixas são destreinamento (< 0,80), ideal (0,80–1,30), atenção moderada (1,31–1,49) e sobrecarga/risco (≥ 1,50). Categorias de base usam janelas adaptativas a partir de cinco check-ins.
4. **Z-score individual:** compara o estado atual com o histórico do atleta e sinaliza elevações a partir de +1,8σ.
5. **Quadro de atenção clínica:** prioriza dores agudas (≥ 6/10), queda acentuada de recuperação, desvios no Z-score e picos de ACWR.

## GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica a edição estática. Gere os arquivos com `npm run build:pages`; eles ficam em `output/github-pages/`. Para validar a publicação, rode `npm run verify:pages`.

## Documentação e validação

As orientações para agentes e desenvolvedores ficam em [`agents/`](agents/):

- [Arquitetura do código](agents/README.md)
- [Conhecimento de domínio](agents/domain-knowledge.md)
- [Tarefas de desenvolvimento](agents/tasks.md)

Rode os testes e valide as fontes do Google Sheets com:

```bash
npm test
npm run sources:validate
```

A suíte unitária contém 64 testes.
