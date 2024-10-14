function displayMembers() {
    const memberList = document.getElementById('memberList');
    memberList.innerHTML = ''; // Clear existing members

    members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member');
        memberDiv.innerHTML = `
            <strong>Name:</strong> ${member.name}<br>
            <strong>Email:</strong> ${member.email}<br>
            <strong>Phone:</strong> ${member.phone}<br>
            <strong>Years in Church:</strong> ${member.years}<br>
            <strong>Position:</strong> ${member.position}
        `;
        memberList.appendChild(memberDiv);
    });
}

document.getElementById('addMemberBtn').addEventListener('click', function() {
    const newMember = {
        name: "New Member",
        email: "newmember@example.com",
        phone: "555-555-5555",
        years: Math.floor(Math.random() * 10) + 1,
        position: "Member"
    };
    members.push(newMember);
    displayMembers();
});

// Initial display of members
displayMembers();
