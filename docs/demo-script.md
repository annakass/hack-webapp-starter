# FitCheck 60-Second Demo Script

“Buying furniture and decor online breaks down when customers cannot tell what
will actually fit. Here, the shopper uploads a room image and asks: find me a
plant that will fit on this table.

FitCheck uses Subconscious TIM-Qwen3.6 for the visual reasoning story. It
identifies the target surface, applies the detected table dimensions, and adds
real-world constraints: tabletop clearance and whether the plant will block the
TV sightline.

The agent ranks Wayfair product matches by exact dimensions. Each card shows the
product footprint, fit verdict, reason, and a Wayfair link. When I scroll through
products and select one, the generated 3D-style visual updates so the shopper can
see how much table space remains.

The best match is compact enough for the 34 inch table and stays below the
sightline limit. A larger monstera looks nice but is flagged as a poor fit
because it is too tall and uses too much tabletop space.

This turns a vague image-based shopping request into a confident purchase
decision, reducing abandoned carts and returns caused by dimension uncertainty.”

## Click Path

1. Open the app at `http://localhost:3000`.
2. Show the bundled uploaded room image.
3. Keep the prompt: “Find me a plant that will fit on this table without
   blocking the TV.”
4. Select the snake plant, olive tree, and monstera cards.
5. Point out the changing visual footprint, fit score, and Wayfair links.
