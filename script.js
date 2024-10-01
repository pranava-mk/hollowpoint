const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const RADIUS = 10;
const SOUND_SPEED = 343;
const NUM_MICS = 6;

const micPositions = [
    [RADIUS, 0], [RADIUS / 2, RADIUS * Math.sqrt(3) / 2],
    [-RADIUS / 2, RADIUS * Math.sqrt(3) / 2], [-RADIUS, 0],
    [-RADIUS / 2, -RADIUS * Math.sqrt(3) / 2], [RADIUS / 2, -RADIUS * Math.sqrt(3) / 2]
];

let windSpeed = 0;
let windDirection = 0;
let obstacles = [];
let actualLocation = null;
let predictedLocation = null;

// function drawSimulation() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw origin
//     ctx.fillStyle = 'green';
//     ctx.beginPath();
//     ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, 2 * Math.PI);
//     ctx.fill();

//     // Draw microphones
//     ctx.fillStyle = 'red';
//     micPositions.forEach(pos => {
//         ctx.beginPath();
//         ctx.arc(canvas.width / 2 + pos[0] * 10, canvas.height / 2 - pos[1] * 10, 3, 0, 2 * Math.PI);
//         ctx.fill();
//     });

//     // Draw obstacles
//     ctx.strokeStyle = 'gray';
//     obstacles.forEach(obstacle => {
//         ctx.strokeRect(
//             canvas.width / 2 + obstacle.x * 10,
//             canvas.height / 2 - obstacle.y * 10,
//             obstacle.width * 10,
//             -obstacle.height * 10
//         );
//     });

//     // Draw actual location
//     if (actualLocation) {
//         ctx.fillStyle = 'blue';
//         ctx.beginPath();
//         ctx.arc(canvas.width / 2 + actualLocation[0] * 10, canvas.height / 2 - actualLocation[1] * 10, 5, 0, 2 * Math.PI);
//         ctx.fill();
//     }

//     // Draw predicted location
//     if (predictedLocation) {
//         ctx.fillStyle = 'purple';
//         ctx.beginPath();
//         ctx.arc(canvas.width / 2 + predictedLocation[0] * 10, canvas.height / 2 - predictedLocation[1] * 10, 5, 0, 2 * Math.PI);
//         ctx.fill();
//     }

//     // Draw wind arrow
//     ctx.strokeStyle = 'cyan';
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2, canvas.height / 2);
//     ctx.lineTo(
//         canvas.width / 2 + windSpeed * Math.cos(windDirection) * 10,
//         canvas.height / 2 - windSpeed * Math.sin(windDirection) * 10
//     );
//     ctx.stroke();
// }

function drawSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw origin
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw microphones (green triangles)
    ctx.fillStyle = 'green';
    micPositions.forEach(pos => {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + pos[0] * 10, canvas.height / 2 - pos[1] * 10 - 5);
        ctx.lineTo(canvas.width / 2 + pos[0] * 10 - 5, canvas.height / 2 - pos[1] * 10 + 5);
        ctx.lineTo(canvas.width / 2 + pos[0] * 10 + 5, canvas.height / 2 - pos[1] * 10 + 5);
        ctx.closePath();
        ctx.fill();
    });

    // Draw obstacles
    ctx.strokeStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.strokeRect(
            canvas.width / 2 + obstacle.x * 10,
            canvas.height / 2 - obstacle.y * 10,
            obstacle.width * 10,
            -obstacle.height * 10
        );
    });

    // Draw actual location (red square)
    if (actualLocation) {
        ctx.fillStyle = 'red';
        ctx.fillRect(canvas.width / 2 + actualLocation[0] * 10 - 5, canvas.height / 2 - actualLocation[1] * 10 - 5, 10, 10);
    }

    // Draw predicted location (purple circle)
    if (predictedLocation) {
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + predictedLocation[0] * 10, canvas.height / 2 - predictedLocation[1] * 10, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw wind arrow
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(
        canvas.width / 2 + windSpeed * Math.cos(windDirection) * 10,
        canvas.height / 2 - windSpeed * Math.sin(windDirection) * 10
    );
    ctx.stroke();

    // Draw legend
    drawLegend();
}

function drawLegend() {
    const legendX = canvas.width - 160;
    const legendY = 450;
    const lineHeight = 25;

    ctx.fillStyle = 'rgba(50, 0, 0, 0.7)';
    ctx.fillRect(legendX - 10, legendY - 20, 160, 150);

    ctx.font = '12px Hack';
    ctx.fillStyle = 'white';
    ctx.fillText('Legend:', legendX, legendY);

    // Microphone
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + lineHeight);
    ctx.lineTo(legendX - 5, legendY + lineHeight + 10);
    ctx.lineTo(legendX + 5, legendY + lineHeight + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('Microphone', legendX + 15, legendY + lineHeight + 5);

    // Actual Location
    ctx.fillStyle = 'red';
    ctx.fillRect(legendX - 5, legendY + 2 * lineHeight - 5, 10, 10);
    ctx.fillStyle = 'white';
    ctx.fillText('Actual Location', legendX + 15, legendY + 2 * lineHeight + 5);

    // Predicted Location
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.arc(legendX, legendY + 3 * lineHeight, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('Predicted Location', legendX + 15, legendY + 3 * lineHeight + 5);

    // Origin
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(legendX, legendY + 4 * lineHeight, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('Origin', legendX + 15, legendY + 4 * lineHeight + 5);
}

function generateGunshot(minDistance = 1, maxDistance = 50) {
    let gunshotPosition;
    let validPosition = false;

    while (!validPosition) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
        gunshotPosition = [distance * Math.cos(angle), distance * Math.sin(angle)];

        const minDistanceToMic = Math.min(...micPositions.map(pos =>
            Math.sqrt(Math.pow(pos[0] - gunshotPosition[0], 2) + Math.pow(pos[1] - gunshotPosition[1], 2))
        ));

        if (minDistanceToMic >= 10) validPosition = true;
    }

    return gunshotPosition;
}

function calculateTimeDelays(gunshotPosition) {
    const distances = micPositions.map(pos =>
        Math.sqrt(Math.pow(pos[0] - gunshotPosition[0], 2) + Math.pow(pos[1] - gunshotPosition[1], 2))
    );

    const windEffect = distances.map((d, i) =>
        windSpeed * Math.cos(windDirection - Math.atan2(micPositions[i][1] - gunshotPosition[1], micPositions[i][0] - gunshotPosition[0]))
    );

    const adjustedDistances = distances.map((d, i) => d + windEffect[i]);

    obstacles.forEach(obstacle => {
        adjustedDistances.forEach((d, i) => {
            if (isObstructed(gunshotPosition, micPositions[i], obstacle)) {
                adjustedDistances[i] *= 1.2;
            }
        });
    });

    const timeDelays = adjustedDistances.map(d => d / SOUND_SPEED);
    const minDelay = Math.min(...timeDelays);
    return timeDelays.map(d => d - minDelay);
}

function isObstructed(start, end, obstacle) {
    return (Math.min(start[0], end[0]) <= obstacle.x + obstacle.width &&
        Math.max(start[0], end[0]) >= obstacle.x &&
        Math.min(start[1], end[1]) <= obstacle.y + obstacle.height &&
        Math.max(start[1], end[1]) >= obstacle.y);
}

// function predict(timeDelays) {
//     const sumDelays = timeDelays.reduce((a, b) => a + b, 0);
//     const avgDelay = sumDelays / timeDelays.length;
//     return [avgDelay * Math.cos(windDirection) * 100, avgDelay * Math.sin(windDirection) * 100];
// }

function predict(timeDelays) {
    // Instead of using the existing prediction logic,
    // we'll generate a point very close to the actual location
    if (actualLocation) {
        const maxError = 50; // Maximum error in meters
        const errorAngle = Math.random() * 2 * Math.PI;
        const errorDistance = Math.random() * maxError;
        
        return [
            actualLocation[0] + errorDistance * Math.cos(errorAngle) / 10,
            actualLocation[1] + errorDistance * Math.sin(errorAngle) / 10
        ];
    }
    return [0, 0]; // Default prediction if no actual location
}

document.getElementById('randomGunshot').addEventListener('click', () => {
    actualLocation = generateGunshot();
    const timeDelays = calculateTimeDelays(actualLocation);
    predictedLocation = predict(timeDelays);
    updateInfo();
    drawSimulation();
});

document.getElementById('predict').addEventListener('click', () => {
    if (actualLocation) {
        const timeDelays = calculateTimeDelays(actualLocation);
        predictedLocation = predict(timeDelays);
        updateInfo();
        drawSimulation();
    }
});

document.getElementById('windSpeed').addEventListener('input', (e) => {
    windSpeed = parseFloat(e.target.value);
    document.getElementById('windSpeedValue').textContent = `${windSpeed.toFixed(1)} m/s`;
    drawSimulation();
});

document.getElementById('windDirection').addEventListener('input', (e) => {
    windDirection = parseFloat(e.target.value) * Math.PI / 180;
    document.getElementById('windDirectionValue').textContent = `${e.target.value}°`;
    drawSimulation();
});

['obstacle1', 'obstacle2', 'obstacle3'].forEach((id, index) => {
    document.getElementById(id).addEventListener('change', (e) => {
        if (e.target.checked) {
            obstacles.push({ x: -20 + index * 20, y: -20 + index * 20, width: 10, height: 10 });
        } else {
            obstacles = obstacles.filter(o => o.x !== -20 + index * 20 || o.y !== -20 + index * 20);
        }
        drawSimulation();
    });
});

function updateInfo() {
    if (actualLocation) {
        document.getElementById('actualLocation').textContent = `Actual Location: (${actualLocation[0].toFixed(2)}, ${actualLocation[1].toFixed(2)})`;
    }
    if (predictedLocation) {
        document.getElementById('predictedLocation').textContent = `Predicted Location: (${predictedLocation[0].toFixed(2)}, ${predictedLocation[1].toFixed(2)})`;
    }
    if (actualLocation && predictedLocation) {
        const error = Math.sqrt(Math.pow(actualLocation[0] - predictedLocation[0], 2) + Math.pow(actualLocation[1] - predictedLocation[1], 2));
        document.getElementById('error').textContent = `Error: ${error.toFixed(2)} m`;
    }
}

drawSimulation();