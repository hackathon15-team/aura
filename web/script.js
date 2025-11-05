function toggleDropdown() {
  const dropdown = document.getElementById('reviewDropdown');
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
}

function openModal() {
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ESC 키로 모달 닫기 (기본 기능이지만 접근성 개선 전에는 aria-modal 없음)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
