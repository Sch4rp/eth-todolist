# 📝 TodoList Contract 

`TodoList` is a simple Ethereum-based task manager that allows the contract owner to create, modify, and delete tasks with a 0.01 ether fee for task creation and a refund upon deletion.

## 🚀 Features 

- **Add Tasks**: Create tasks with a 0.01 ether fee, marked initially as `OPEN`.
- **Modify Tasks**: Update task title and status.
- **Delete Tasks**: Remove tasks and receive a 0.01 ether refund.
- **View Tasks**: Only the owner can view all tasks.

## 📦 Installation 

```bash
git clone https://github.com/Sch4rp/eth-todolist.git
cd eth-todolist
yarn install
```

## 🧪 Testing
```bash
npx hardhat test
```

## 📃 License
This project is licensed under [GNU General Public License v3.0](https://opensource.org/licenses/GPL-3.0).
Free to use, distribute, and modify. This contract was developed for educational purposes.
