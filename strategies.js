// Zoe Zones - Strategy Library
// Grounded in Zones of Regulation framework and sensory-informed SEL practice
// Strategies are single-action, 4th-grade language, 3-4 word titles

const STRATEGIES = {

    blue: [
        {
            id: 'blue-movement-break',
            title: 'Movement Break',
            description: 'Sometimes your body just needs to wake up and get moving.',
            steps: ['Stand up and do 10 jumping jacks, then take a slow breath and sit back down.']
        },
        {
            id: 'blue-think-good',
            title: 'Think of Something Good',
            description: 'Your brain can shift its mood by visiting a happy memory.',
            steps: ['Close your eyes and picture one thing that made you smile recently — hold that picture in your mind for 30 seconds.']
        },
        {
            id: 'blue-wall-push',
            title: 'Wall Push',
            description: 'Pushing against something heavy wakes up your muscles and your brain.',
            steps: ['Find a wall, place both hands flat on it, and push as hard as you can for 10 seconds. Release and notice how your body feels.']
        },
        {
            id: 'blue-chair-pushup',
            title: 'Chair Push-Up',
            description: 'Heavy muscle work helps your body feel more alert and ready.',
            steps: ['Put your hands on the sides of your chair seat, press down, and lift yourself up off the seat for 5 seconds. Do this 3 times.']
        },
        {
            id: 'blue-stretch-wake',
            title: 'Stretch and Wake Up',
            description: 'A full-body stretch signals your brain that it\'s time to be present.',
            steps: ['Reach both arms as high as you can toward the ceiling, hold for 5 seconds, then slowly roll down and touch your toes. Come back up slowly.']
        }
    ],

    green: [
        {
            id: 'green-stay-ready',
            title: 'Stay Ready',
            description: 'You\'re already in a great place. A quick check-in keeps you there.',
            steps: ['Take one slow breath, sit up tall, and remind yourself: "I am ready to learn."']
        },
        {
            id: 'green-help-friend',
            title: 'Help a Friend',
            description: 'Helping someone else is one of the best ways to stay in the green zone.',
            steps: ['Look around and see if a classmate needs help with something. Ask your teacher first, then offer a hand.']
        },
        {
            id: 'green-set-goal',
            title: 'Set a Goal',
            description: 'When you feel good, it\'s a great time to decide what you want to accomplish.',
            steps: ['Think of one thing you want to finish or do well today. Say it quietly to yourself or write it down.']
        }
    ],

    yellow: [
        {
            id: 'yellow-belly-breathing',
            title: 'Belly Breathing',
            description: 'Deep belly breaths tell your nervous system it\'s safe to calm down.',
            steps: ['Put one hand on your belly. Breathe in slowly for 4 counts until your hand rises. Breathe out for 4 counts. Repeat 4 times.']
        },
        {
            id: 'yellow-box-breathing',
            title: 'Box Breathing',
            description: 'Box breathing is used by athletes and astronauts to get focused fast.',
            steps: ['Breathe in for 4 counts. Hold for 4 counts. Breathe out for 4 counts. Hold for 4 counts. That\'s one box. Do it 3 times.']
        },
        {
            id: 'yellow-squeeze-release',
            title: 'Squeeze and Release',
            description: 'Tensing and releasing your muscles helps your body let go of big feelings.',
            steps: ['Make two tight fists and squeeze every muscle in your body as hard as you can for 5 seconds. Then let everything go all at once. Breathe out.']
        },
        {
            id: 'yellow-count-ten',
            title: 'Count to Ten',
            description: 'Counting gives your thinking brain something to do while your feeling brain settles.',
            steps: ['Close your eyes and count slowly from 1 to 10 in your head. Picture each number. By 10, check in — do you feel a little steadier?']
        },
        {
            id: 'yellow-wall-push',
            title: 'Wall Push',
            description: 'Pushing hard against a wall gives your body a safe place to send big energy.',
            steps: ['Find a wall, place both hands flat on it, and push as hard as you can for 10 seconds. Release slowly and take a breath.']
        },
        {
            id: 'yellow-guided-doodle',
            title: 'Guided Doodle',
            description: 'Drawing shapes in a pattern gives your brain a calm focus to lock onto.',
            steps: ['On any paper, slowly draw a spiral starting from the outside and working inward. Keep your breathing slow as your pencil moves.']
        }
    ],

    red: [
        {
            id: 'red-take-space',
            title: 'Take Space',
            description: 'Sometimes the most powerful thing you can do is step back.',
            steps: ['Ask your teacher for a movement pass or move to a quieter spot in the room. Sit quietly until you feel your heart slow down.']
        },
        {
            id: 'red-stomp-out',
            title: 'Stomp It Out',
            description: 'Heavy leg movement sends big feelings down and out through your feet.',
            steps: ['If you can step outside or to a hallway, stomp your feet hard 10 times. Feel the energy leaving your body with each stomp.']
        },
        {
            id: 'red-talk-someone',
            title: 'Talk to Someone',
            description: 'You don\'t have to carry a big feeling alone.',
            steps: ['Find a trusted adult — your teacher, a counselor, or another helper — and tell them: "I\'m in the red zone and I need help getting back."']
        },
        {
            id: 'red-wall-push',
            title: 'Wall Push',
            description: 'When feelings are really big, your body needs somewhere to send that force.',
            steps: ['Put both hands flat on a wall and push with everything you have for 10 seconds. Let the wall take it. Release, breathe out slowly.']
        },
        {
            id: 'red-box-breathing',
            title: 'Box Breathing',
            description: 'Your breath is the fastest way to bring your brain back from red.',
            steps: ['Breathe in for 4 counts. Hold for 4 counts. Breathe out for 4 counts. Hold for 4 counts. Keep going until red starts to fade.']
        }
    ]
};
