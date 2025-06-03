let currentBMI = 0;
let currentWeight = 0;
let currentHeight = 0;
let currentCategory = "";
let alertTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculateBtn').addEventListener('click', calculateBMI);
    document.getElementById('whatsappBtn').addEventListener('click', openWhatsApp);
    

    document.getElementById('weight').addEventListener('input', function() {
        if (this.value > 350) {
            this.value = 350;
            showAlert("El peso máximo permitido es 350 kg", true);
        }
    });
    
    document.getElementById('height').addEventListener('input', function() {
        if (this.value > 2.20) {
            this.value = 2.20;
            showAlert("La altura máxima permitida es 2.20 metros", true);
        }
    });

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    document.querySelectorAll('input, button, .whatsapp-btn, tr').forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-2px)';
            el.style.transition = 'all 0.2s ease';
            playHoverSound();
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });

        el.addEventListener('touchstart', () => {
            el.style.transform = 'scale(0.98)';
            playHoverSound();
        });
        
        el.addEventListener('touchend', () => {
            el.style.transform = '';
        });
    });
});

function playHoverSound() {
    const hoverSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-interface-hover-notification-911.mp3');
    hoverSound.volume = 0.1;
    hoverSound.play().catch(e => console.log("No se pudo reproducir sonido hover"));
}

function showAlert(message, isError = true) {

    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
        clearTimeout(alertTimeout);
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-message';
    alertDiv.innerHTML = `
        <i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">Entendido</button>
    `;
    document.body.appendChild(alertDiv);

    const alertSound = new Audio(isError ? 
        'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3' : 
        'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    alertSound.volume = 0.3;
    alertSound.play().catch(e => console.log("No se pudo reproducir sonido: ", e));

    alertTimeout = setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 500);
        }
    }, 5000);
}

function calculateBMI() {
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const analyzingText = document.getElementById('analyzingText');
    const resultDiv = document.getElementById('result');
    const whatsappBtn = document.getElementById('whatsappBtn');

    resultDiv.style.display = "none";
    whatsappBtn.style.display = "none";
    
    currentWeight = parseFloat(document.getElementById('weight').value);
    currentHeight = parseFloat(document.getElementById('height').value);
 
    if (isNaN(currentWeight) || isNaN(currentHeight)) {
        showAlert("Por favor ingrese valores válidos para peso y altura", true);
        return;
    }
    
    if (currentWeight <= 0 || currentHeight <= 0) {
        showAlert("El peso y altura deben ser valores positivos", true);
        return;
    }
    
    if (currentHeight > 2.20) {
        showAlert("¡Altura máxima excedida! El límite es 2.20 metros", true);
        return;
    }
    
    if (currentWeight > 350) {
        showAlert("¡Peso máximo excedido! El límite es 350 kg", true);
        return;
    }


    progressContainer.style.display = "block";
    analyzingText.style.display = "block";
    progressBar.style.width = "0";

    setTimeout(() => {
        progressBar.style.width = "100%";
    }, 50);

    const messages = [
        "Analizando composición corporal...",
        "Calculando índice metabólico...",
        "Evaluando resultados...",
        "Preparando recomendaciones..."
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        analyzingText.textContent = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;
    }, 800);    

    setTimeout(() => {

        currentBMI = currentWeight / Math.pow(currentHeight, 2);

        let resultClass;
        let warningMessage = '';
        let icon = '';
        
        if (currentBMI < 16) {
            currentCategory = "Delgadez severa";
            resultClass = "underweight";
            icon = 'fa-skull-crossbones';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Atención urgente:</strong> Tu peso está peligrosamente bajo.<div class="warning-details">Consulta con un especialista inmediatamente. La delgadez extrema puede causar graves problemas de salud.</div></div>';
        } else if (currentBMI >= 16 && currentBMI < 18.5) {
            currentCategory = "Delgadez";
            resultClass = "underweight";
            icon = 'fa-exclamation-circle';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Atención:</strong> Tu peso está por debajo del rango saludable.<div class="warning-details">Te recomendamos consultar con un especialista para evaluar tu estado nutricional y recibir orientación adecuada.</div></div>';
        } else if (currentBMI >= 18.5 && currentBMI < 25) {
            currentCategory = "Peso normal";
            resultClass = "normal";
            icon = 'fa-check-circle';
        } else if (currentBMI >= 25 && currentBMI < 30) {
            currentCategory = "Sobrepeso";
            resultClass = "overweight";
            icon = 'fa-exclamation-triangle';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Atención:</strong> Tu peso está por encima del rango saludable.<div class="warning-details">Considera hacer cambios en tu estilo de vida, mejorar tu alimentación y aumentar la actividad física. Consultar con un nutricionista puede ser de gran ayuda.</div></div>';
        } else if (currentBMI >= 30 && currentBMI < 35) {
            currentCategory = "Obesidad grado I";
            resultClass = "obesity";
            icon = 'fa-exclamation-triangle';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Atención importante:</strong> Tu peso está significativamente por encima del rango saludable.<div class="warning-details">Te recomendamos consultar con un especialista en nutrición y considerar cambios significativos en tu estilo de vida para reducir riesgos de salud.</div></div>';
        } else if (currentBMI >= 35 && currentBMI < 40) {
            currentCategory = "Obesidad grado II";
            resultClass = "obesity";
            icon = 'fa-exclamation-triangle';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Atención urgente:</strong> Tu salud está en riesgo.<div class="warning-details">Consulta con un especialista lo antes posible. La obesidad grado II aumenta significativamente el riesgo de enfermedades graves como diabetes y problemas cardiovasculares.</div></div>';
        } else {
            currentCategory = "Obesidad grado III";
            resultClass = "obesity";
            icon = 'fa-skull-crossbones';
            warningMessage = '<div class="warning-message" onclick="this.classList.toggle(\'collapsed\')"><i class="fas fa-exclamation-triangle"></i> <strong>Emergencia médica:</strong> Tu peso representa un grave riesgo para tu salud.<div class="warning-details">Busca ayuda profesional inmediatamente. La obesidad mórbida requiere atención médica urgente y un plan de tratamiento supervisado por especialistas.</div></div>';
        }

        let recommendation = '';
        if (currentBMI >= 30) {
            recommendation = '<p><i class="fas fa-heartbeat"></i> <strong>Recomendación:</strong> Consulta urgente con un especialista en nutrición y endocrinología para evaluación completa. Considera realizar exámenes médicos para evaluar posibles complicaciones asociadas al peso.</p>';
        } else if (currentBMI >= 25) {
            recommendation = '<p><i class="fas fa-utensils"></i> <strong>Recomendación:</strong> Programa una consulta con nutricionista y aumenta tu actividad física gradualmente. Pequeños cambios sostenibles pueden marcar una gran diferencia.</p>';
        } else if (currentBMI < 18.5) {
            recommendation = '<p><i class="fas fa-apple-alt"></i> <strong>Recomendación:</strong> Consulta con un nutricionista para desarrollar un plan de alimentación saludable para ganar peso. Es importante aumentar masa muscular, no solo grasa corporal.</p>';
        } else {
            recommendation = '<p><i class="fas fa-thumbs-up"></i> <strong>Recomendación:</strong> ¡Buen trabajo! Mantén hábitos saludables y actividad física regular. Realiza controles periódicos para mantenerte en este rango saludable.</p>';
        }

        resultDiv.innerHTML = `
            <h3><i class="fas ${icon}"></i> Resultados de tu IMC</h3>
            <p><strong>IMC:</strong> ${currentBMI.toFixed(2)}</p>
            <p><strong>Clasificación:</strong> ${currentCategory}</p>
            ${warningMessage}
            ${recommendation}
            <p><i class="fas fa-info-circle"></i> Recuerda que el IMC es solo una referencia y no tiene en cuenta masa muscular, complexión ósea u otros factores individuales.</p>
        `;
        
        resultDiv.className = resultClass;
        resultDiv.style.display = "block";

        setTimeout(() => {
            whatsappBtn.style.display = "flex";
        }, 300);
        
      
        if (currentBMI < 18.5 || currentBMI >= 25) {
            const warningSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
            warningSound.volume = 0.2;
            warningSound.play().catch(e => console.log("No se pudo reproducir sonido: ", e));
        }

        clearInterval(messageInterval);
        
        setTimeout(() => {
            progressContainer.style.display = "none";
            analyzingText.style.display = "none";
            progressBar.style.width = "0";
        }, 500);
        
    }, 3500);
}

function openWhatsApp() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    
    if (!weight || !height || currentBMI === 0) {
        showAlert("Primero calcula tu IMC antes de enviar", true);
        return;
    }

    const message = `.ai ¡Hola! Acabo de usar la calculadora de IMC y me gustaría recibir asesoría:

Mis datos:
- Peso: ${currentWeight} kg
- Altura: ${currentHeight} m
- IMC calculado: ${currentBMI.toFixed(2)}
- Clasificación: ${currentCategory}

¿Podrían brindarme recomendaciones personalizadas sobre nutrición y estilo de vida saludable? ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/593986755613?text=${encodedMessage}`, '_blank');
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}