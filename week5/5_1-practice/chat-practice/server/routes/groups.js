const express = require('express');
const router = express.Router();

let groups = [
    { id: 1, name: 'General' },
    { id: 2, name: 'Study Group' },
];
let nextId = 3;

// Задержка 800 мс — чтобы был виден индикатор загрузки
router.get('/', (req, res) => setTimeout(() => res.json(groups), 800));

router.post('/', (req, res) => {
    const name = (req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const group = { id: nextId++, name };
    groups.push(group);
    res.status(201).json(group);
});

router.patch('/:id', (req, res) => {
    const group = groups.find((g) => g.id === Number(req.params.id));
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const name = (req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Name is required' });

    group.name = name;
    res.json(group);
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (id === 1) return res.status(403).json({ error: 'General cannot be deleted' }); // чтобы увидеть 403

    const before = groups.length;
    groups = groups.filter((g) => g.id !== id);

    if (groups.length === before) return res.status(404).json({ error: 'Group not found' });
    res.status(204).end();
});

module.exports = router;
