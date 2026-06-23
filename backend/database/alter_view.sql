ALTER VIEW vw_DoctorList AS
SELECT
    d.id,
    u.name,
    u.email,
    d.specialty,
    d.rating,
    d.reviews,
    d.experience,
    d.available,
    d.avatar,
    d.price,
    d.location,
    d.bio,
    d.schedule
FROM  Doctors d
JOIN  Users   u ON d.user_id = u.id
WHERE u.is_active = 1 AND d.verification_status = 'approved';
