pragma solidity ^0.8.27;

contract TodoList {
    enum TaskStatus {
        OPEN,
        DOING,
        DONE
    }

    struct Task {
        string title;
        TaskStatus status;
        uint createdAt;
    }

    Task[] private tasks;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    function getTasks() external view onlyOwner returns (Task[] memory) {
        return tasks;
    }

    function addTask(string calldata title) external payable onlyOwner {
        require(msg.value == 0.01 ether, "Price must be 0.01 ether");

        tasks.push(Task(title, TaskStatus.OPEN, block.timestamp));
    }

    function modifyTask(uint index, string calldata newTitle, TaskStatus newStatus) external onlyOwner {
        require(index < tasks.length, "Task does not exist");

        Task storage task = tasks[index];
        task.title = newTitle;
        task.status = newStatus;
    }

    function deleteTask(uint index) external onlyOwner {
        require(index < tasks.length, "Task does not exist");

        tasks[index] = tasks[tasks.length - 1];
        tasks.pop();

        payable(msg.sender).transfer(0.01 ether);
    }
}
