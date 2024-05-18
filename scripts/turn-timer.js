class TurnTimerApp extends Application {
    constructor(options = {}) {
        super(options);
        this.turnData = {};
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "turn-timer",
            title: "Combat Turn Timer",
            template: "modules/turn-timer/templates/turn-timer.html",
            resizable: true,
            minimizable: true,
            width: 400,
            height: 600
        });
    }

    getData() {
        // Calculate averages and medians here
        for (const [key, value] of Object.entries(this.turnData)) {
            if (value.turns.length) {
                let sum = value.turns.reduce((a, b) => a + b, 0);
                value.average = (sum / value.turns.length).toFixed(2);
                value.median = this.median(value.turns);
            }
        }
        return {
            players: this.turnData
        };
    }

    median(values) {
        if (values.length === 0) throw new Error("No inputs");
        values.sort((a, b) => a - b);
        let half = Math.floor(values.length / 2);
        if (values.length % 2) {
            return values[half];
        } else {
            return (values[half - 1] + values[half]) / 2.0;
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("#reset-stats").click(() => {
            this.turnData = {};
            this.render();
        });
    }
}

Hooks.on("ready", function() {
    let turnTimerApp = new TurnTimerApp();
    turnTimerApp.render(true);

    let startTime = null;

    Hooks.on("updateCombat", (combat, update, options, userId) => {
        if (update.turn !== undefined) {
            const currentTurn = combat.turns[combat.turn];
            const actorName = currentTurn.actor.name;

            if (startTime) {
                let endTime = Date.now();
                let duration = (endTime - startTime) / 1000;
                if (!turnTimerApp.turnData[actorName]) turnTimerApp.turnData[actorName] = {turns: []};
                turnTimerApp.turnData[actorName].turns.push(duration);
                turnTimerApp.render();
            }
            startTime = Date.now();
        }
    });
});
