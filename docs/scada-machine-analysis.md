# SCADA machine flow analysis

## Objetivo

Criar exemplos visuais de maquinas industriais sem alterar o simulador atual. O simulador continua emitindo `simulator:update`, o servidor continua fazendo broadcast de `machine:update`, e a tela SCADA consome esses eventos para animar a planta, KPIs e graficos.

## Referencia analisada

O exemplo `clientIO/joint-demos/scada` mostra o padrao visual que queremos: planta industrial em estilo P&ID/SCADA, com tanques, bombas, valvulas, tubulacoes e fluxo animado.

Referencias:

- https://github.com/clientIO/joint-demos/tree/main/scada
- https://github.com/clientIO/joint-demos/tree/main/scada/js
- https://raw.githubusercontent.com/clientIO/joint-demos/main/scada/js/package.json

O demo JavaScript usa `@joint/plus` e declara licenca JointJS+ no `package.json`. Para este projeto, a implementacao mais segura e um exemplo em React/SVG puro, sem adicionar dependencia licenciada ou acoplar a tela ao editor grafico.

## Arquitetura recomendada

1. Simulador envia sensores por maquina.
2. Backend atualiza o snapshot em memoria.
3. Backend publica `machine:update`.
4. Tela SCADA mantém:
   - ultimo snapshot por maquina;
   - historico curto por maquina;
   - estado derivado de severidade e offline.
5. SVG mostra a planta e anima linhas conforme as maquinas ficam online e recebem sensores.

## Contrato atual aproveitado

```js
{
  id: 'machine-1',
  name: 'Esteira 01',
  type: 'Esteira Inteligente',
  status: 'online',
  sensors: {
    temperature: 72,
    vibration: 8,
    speed: 1200
  },
  actuators: {
    motor: true
  },
  lastUpdate: 1710000000000
}
```

## Contrato futuro recomendado

Quando o exemplo evoluir para produto, vale normalizar sensores com unidade, qualidade e limites:

```js
{
  machineId: 'compressor-01',
  status: 'online',
  timestamp: '2026-07-01T02:00:00.000Z',
  sensors: {
    temperature: { value: 82.4, unit: 'C', quality: 'good', max: 90 },
    vibration: { value: 6.2, unit: 'mm/s', quality: 'good', max: 8 },
    pressure: { value: 7.8, unit: 'bar', quality: 'good', max: 10 }
  },
  alarms: [
    { code: 'TEMP_HIGH', severity: 'warning', message: 'Temperatura alta' }
  ]
}
```

## Regras de UI

- A planta deve funcionar com varias maquinas ao mesmo tempo.
- A animacao deve depender do status e da energia dos sensores, nao de dados fake locais.
- O grafico deve usar historico local com janela limitada para evitar crescimento infinito.
- Offline deve ser derivado tanto de `status` quanto de `lastUpdate` antigo.
- Sensores desconhecidos aparecem como dados tecnicos, sem quebrar a tela.

## Caminho de evolucao

- Persistir historico em banco/time-series.
- Separar eventos futuros: `sensor:update`, `alarm:update`, `machine:status`.
- Adicionar editor visual depois, se fizer sentido, mas mantendo o runtime SCADA desacoplado.
- Criar comandos SCADA (`command:send`) apenas com autenticacao, autorizacao e auditoria.
