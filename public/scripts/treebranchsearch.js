document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', filterTree);
  
    function filterTree() {
      const filterValue = searchInput.value.toLowerCase();
      const treeBranches = document.querySelectorAll('.tree-branch-link');
  
      treeBranches.forEach(treeBranch => {
        const branchText = treeBranch.textContent.toLowerCase();
        const branchParent = treeBranch.closest('.tree-branch');
  
        if (branchText.includes(filterValue)) {
          branchParent.style.display = 'block';
        } else {
          branchParent.style.display = 'none';
        }
      });
    }
  });