const checkRefundable = (transaction) => {
    return (transaction.paymentStatus === 'paid' || transaction.paymentStatus === 'succeeded') &&
        transaction.refundStatus !== 'refunded' &&
        transaction.appointmentStatus !== 'cancelled' &&
        transaction.appointmentStatus !== 'completed';
};

const scenarios = [
    {
        name: "Scenario 1",
        tx: { appointmentStatus: 'pending', paymentStatus: 'paid', refundStatus: null },
        expected: true
    },
    {
        name: "Scenario 2",
        tx: { appointmentStatus: 'cancelled', paymentStatus: 'paid', refundStatus: null },
        expected: false
    },
    {
        name: "Scenario 3",
        tx: { appointmentStatus: 'completed', paymentStatus: 'paid', refundStatus: null },
        expected: false
    },
    {
        name: "Scenario 4",
        tx: { appointmentStatus: 'pending', paymentStatus: 'refunded', refundStatus: 'refunded' },
        expected: false
    }
];

scenarios.forEach(s => {
    const actual = checkRefundable(s.tx);
    console.log(`${s.name}: Expected ${s.expected}, Got ${actual} -> ${actual === s.expected ? 'PASS' : 'FAIL'}`);
});
