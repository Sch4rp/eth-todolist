pragma solidity 0.8.27;

contract TodoList {
    enum TaskStatus {
        OPEN,
        DOING,
        DONE
    }

    struct Task {
        string title;
        TaskStatus status;
        uint256 createdAt;
    }

    Task[] private tasks;
    address public owner;

    error TaskDoesNotExist();
    error PriceMustBe0_01Ether();
    error OnlyOwner();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    function getTasks() external view onlyOwner returns (Task[] memory) {
        // add pagination
        return tasks;
    }

    function addTask(string calldata title) external payable onlyOwner {
        if (msg.value != 0.01 ether) revert PriceMustBe0_01Ether();

        tasks.push(Task(title, TaskStatus.OPEN, block.timestamp));
    }

    function modifyTask(uint256 index, string calldata newTitle, TaskStatus newStatus) external onlyOwner {
        if (index >= tasks.length) revert TaskDoesNotExist();

        Task storage task = tasks[index];
        task.title = newTitle;
        task.status = newStatus;
    }

    function deleteTask(uint256 index) external onlyOwner {
        if (index >= tasks.length) revert TaskDoesNotExist();

        tasks[index] = tasks[tasks.length - 1];
        tasks.pop();

        payable(owner).transfer(0.01 ether);
    }
}
