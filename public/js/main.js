// CodeAlpha Social Media Platform - Frontend Interactivity

document.addEventListener('DOMContentLoaded', () => {

    // 1. AJAX Like Button Handler
    const likeForms = document.querySelectorAll('.like-form');
    likeForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const actionUrl = form.action;
            const button = form.querySelector('.like-btn');
            const icon = button.querySelector('i');
            const countSpan = button.querySelector('.like-count');

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to like post');
                }

                const data = await response.json();

                if (data.liked) {
                    button.classList.add('liked');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    button.classList.remove('liked');
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }

                if (countSpan) {
                    // Check if current text contains suffix like " Likes"
                    if (countSpan.textContent.includes('Likes')) {
                        countSpan.textContent = `${data.likesCount} Likes`;
                    } else {
                        countSpan.textContent = data.likesCount;
                    }
                }
            } catch (err) {
                console.error('Like error:', err);
                // Fallback to standard form submission
                form.submit();
            }
        });
    });

    // 2. AJAX Follow Button Handler
    const followForms = document.querySelectorAll('.follow-form');
    followForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const actionUrl = form.action;
            const button = form.querySelector('.follow-btn');
            const followersCountElem = document.getElementById('followers-count');

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(errorData.error || 'Failed to follow user');
                    return;
                }

                const data = await response.json();

                if (data.following) {
                    button.textContent = 'Following';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-secondary');
                } else {
                    button.textContent = 'Follow';
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-primary');
                }

                if (followersCountElem && data.followersCount !== undefined) {
                    followersCountElem.textContent = data.followersCount;
                }
            } catch (err) {
                console.error('Follow error:', err);
                form.submit();
            }
        });
    });

    // 3. Edit Profile Collapsible Toggle
    const toggleEditBtn = document.getElementById('toggle-edit-profile-btn');
    const editSection = document.getElementById('edit-profile-section');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    if (toggleEditBtn && editSection) {
        toggleEditBtn.addEventListener('click', () => {
            editSection.classList.toggle('hidden');
            if (!editSection.classList.contains('hidden')) {
                editSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (cancelEditBtn && editSection) {
        cancelEditBtn.addEventListener('click', () => {
            editSection.classList.add('hidden');
        });
    }

});
